DROP POLICY IF EXISTS "admins read carts" ON public.cart_items;
CREATE POLICY "admins read carts" ON public.cart_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));