-- Temporary permissive SELECT policies until auth is implemented
-- These should be replaced with proper auth-based policies later

CREATE POLICY "Temp: allow all reads on students"
  ON public.students FOR SELECT
  USING (true);

CREATE POLICY "Temp: allow all reads on lessons"
  ON public.lessons FOR SELECT
  USING (true);

CREATE POLICY "Temp: allow all reads on skill_categories"
  ON public.skill_categories FOR SELECT
  USING (true);

CREATE POLICY "Temp: allow all reads on skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Temp: allow all reads on student_skills"
  ON public.student_skills FOR SELECT
  USING (true);

CREATE POLICY "Temp: allow all reads on skill_history"
  ON public.skill_history FOR SELECT
  USING (true);
