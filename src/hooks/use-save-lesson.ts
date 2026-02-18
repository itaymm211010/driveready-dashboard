import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SkillScore } from '@/lib/scoring';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

interface SaveLessonParams {
  lessonId: string;
  studentId: string;
  paymentMethod: 'cash' | 'receipt' | 'debt';
  amount: number;
  skillOverrides: Record<string, SkillScore>;
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
      const now = new Date().toISOString();

      // 1. Read lesson to get actual_start_time and scheduled_duration
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('actual_start_time, scheduled_duration_minutes')
        .eq('id', lessonId)
        .single();

      const actualStartTime = (currentLesson as any)?.actual_start_time;
      const scheduledDuration = (currentLesson as any)?.scheduled_duration_minutes;
      const actualDuration = actualStartTime
        ? Math.round((new Date(now).getTime() - new Date(actualStartTime).getTime()) / 60000)
        : durationMinutes;
      const variance = scheduledDuration != null ? actualDuration - scheduledDuration : null;

      // 2. Update lesson status, payment & time fields
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
          actual_end_time: now,
          actual_duration_minutes: actualDuration,
          duration_variance_minutes: variance,
        } as any)
        .eq('id', lessonId);

      if (lessonErr) throw lessonErr;

      // 3. Insert time log entry for 'ended'
      await supabase.from('lesson_time_log' as any).insert({
        lesson_id: lessonId,
        event_type: 'ended',
      });

      // 4. If debt, add amount to student balance
      if (paymentMethod === 'debt') {
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

      // 5. Upsert student_skills and insert skill_history
      for (const skillId of practicedSkillIds) {
        const newScore = skillOverrides[skillId] ?? 0;
        const note = notes[skillId] || null;

        const { data: existing, error: checkErr } = await supabase
          .from('student_skills')
          .select('id, times_practiced, current_score')
          .eq('student_id', studentId)
          .eq('skill_id', skillId)
          .maybeSingle();

        if (checkErr) throw checkErr;

        let studentSkillId: string;

        if (existing) {
          const updates: Record<string, unknown> = {
            times_practiced: existing.times_practiced + 1,
            last_practiced_date: today,
          };
          if (newScore > 0) updates.current_score = newScore;
          if (note) updates.last_note = note;

          const { error: upErr } = await supabase
            .from('student_skills')
            .update(updates)
            .eq('id', existing.id);
          if (upErr) throw upErr;
          studentSkillId = existing.id;
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from('student_skills')
            .insert([{
              student_id: studentId,
              skill_id: skillId,
              current_score: newScore,
              times_practiced: 1,
              last_practiced_date: today,
              last_note: note,
            }])
            .select('id')
            .single();
          if (insErr) throw insErr;
          studentSkillId = inserted.id;
        }

        const { error: histErr } = await supabase.from('skill_history').insert([{
          student_skill_id: studentSkillId,
          lesson_id: lessonId,
          lesson_date: today,
          score: newScore,
          teacher_note: note,
          practice_duration_minutes: durationMinutes,
        }]);
        if (histErr) throw histErr;
      }

      // 6. Increment total_lessons
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

      // 7. Readiness is now calculated by a database trigger automatically
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['skill-tree'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });
}
