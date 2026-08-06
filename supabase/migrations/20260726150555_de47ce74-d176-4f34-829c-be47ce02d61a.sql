ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS admin_reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

DROP POLICY IF EXISTS "Admins can update contact_messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact_messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));