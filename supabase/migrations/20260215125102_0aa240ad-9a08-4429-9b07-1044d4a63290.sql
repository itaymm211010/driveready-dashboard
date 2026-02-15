-- Temp write policies until auth is implemented
CREATE POLICY "Temp: allow all writes on lessons"
ON public.lessons FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Temp: allow all writes on student_skills"
ON public.student_skills FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Temp: allow all writes on skill_history"
ON public.skill_history FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Temp: allow all writes on students"
ON public.students FOR UPDATE
USING (true)
WITH CHECK (true);
