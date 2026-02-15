import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SkillStatus } from '@/data/mock';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

interface SaveLessonParams {
  lessonId: string;
  studentId: string;
  paymentMethod: 'cash' | 'receipt' | 'debt';
  amount: number;
  skillOverrides: Record<string, SkillStatus>;
  notes: Record<string, string>;
  durationSeconds: number;
}

export function useSaveLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      studentId,
      paymentMethod,
      amount,
      skillOverrides,
      notes,
      durationSeconds,
    }: SaveLessonParams) => {
      const today = new Date().toISOString().slice(0, 10);
      const durationMinutes = Math.round(durationSeconds / 60);

      // 1. Update lesson status & payment
      const paymentStatus = paymentMethod === 'debt' ? 'debt' : 'paid';
      const practicedSkillIds = [
        ...new Set([...Object.keys(skillOverrides), ...Object.keys(notes)]),
      ];

      const { error: lessonErr } = await supabase
        .from('lessons')
        .update({
          status: 'completed',
          payment_status: paymentStatus,
          skills_practiced: practicedSkillIds,
        })
        .eq('id', lessonId);

      if (lessonErr) throw lessonErr;

      // 2. If debt, add amount to student balance
      if (paymentMethod === 'debt') {
        // Read current balance then update
        const { data: student, error: sErr } = await supabase
          .from('students')
          .select('balance')
          .eq('id', studentId)
          .single();
        if (sErr) throw sErr;

        const { error: balErr } = await supabase
          .from('students')
          .update({ balance: Number(student.balance) + amount })
          .eq('id', studentId);
        if (balErr) throw balErr;
      }

      // 3. Upsert student_skills and insert skill_history for each practiced skill
      for (const skillId of practicedSkillIds) {
        const newStatus = skillOverrides[skillId];
        const note = notes[skillId] || null;

        // Check if student_skill exists
        const { data: existing, error: checkErr } = await supabase
          .from('student_skills')
          .select('id, times_practiced, current_status')
          .eq('student_id', studentId)
          .eq('skill_id', skillId)
          .maybeSingle();

        if (checkErr) throw checkErr;

        let studentSkillId: string;

        if (existing) {
          // Update existing
          const updates: Record<string, unknown> = {
            times_practiced: existing.times_practiced + 1,
            last_practiced_date: today,
          };
          if (newStatus) updates.current_status = newStatus;
          if (note) updates.last_note = note;

          const { error: upErr } = await supabase
            .from('student_skills')
            .update(updates)
            .eq('id', existing.id);
          if (upErr) throw upErr;
          studentSkillId = existing.id;
        } else {
          // Insert new
          const { data: inserted, error: insErr } = await supabase
            .from('student_skills')
            .insert({
              student_id: studentId,
              skill_id: skillId,
              current_status: newStatus ?? 'not_learned',
              times_practiced: 1,
              last_practiced_date: today,
              last_note: note,
            })
            .select('id')
            .single();
          if (insErr) throw insErr;
          studentSkillId = inserted.id;
        }

        // Insert skill_history entry
        const { error: histErr } = await supabase.from('skill_history').insert({
          student_skill_id: studentSkillId,
          lesson_id: lessonId,
          lesson_date: today,
          status: newStatus ?? existing?.current_status ?? 'not_learned',
          teacher_note: note,
          practice_duration_minutes: durationMinutes,
        });
        if (histErr) throw histErr;
      }

      // 4. Increment total_lessons
      const { data: studentData, error: stErr } = await supabase
        .from('students')
        .select('total_lessons')
        .eq('id', studentId)
        .single();
      if (stErr) throw stErr;

      const { error: tlErr } = await supabase
        .from('students')
        .update({ total_lessons: (studentData.total_lessons ?? 0) + 1 })
        .eq('id', studentId);
      if (tlErr) throw tlErr;

      // 5. Recalculate readiness_percentage
      const { count: totalSkills } = await supabase
        .from('skills')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', TEACHER_ID);

      const { count: masteredSkills } = await supabase
        .from('student_skills')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('current_status', 'mastered');

      const readiness = totalSkills && totalSkills > 0
        ? Math.round(((masteredSkills ?? 0) / totalSkills) * 100)
        : 0;

      const { error: rErr } = await supabase
        .from('students')
        .update({ readiness_percentage: readiness })
        .eq('id', studentId);
      if (rErr) throw rErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['skill-tree'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });
}
