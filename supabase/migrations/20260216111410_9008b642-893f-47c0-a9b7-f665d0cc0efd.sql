CREATE POLICY "Temp: allow all inserts on students"
ON public.students
FOR INSERT
WITH CHECK (true);