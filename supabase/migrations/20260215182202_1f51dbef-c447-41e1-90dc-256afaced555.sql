CREATE POLICY "Temp: allow all inserts on lessons"
ON public.lessons
FOR INSERT
WITH CHECK (true);