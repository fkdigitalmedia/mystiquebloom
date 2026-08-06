DROP POLICY IF EXISTS "Users delete own gift boxes" ON public.gift_boxes;
CREATE POLICY "Users delete own gift boxes" ON public.gift_boxes FOR DELETE TO authenticated USING (auth.uid() = user_id);