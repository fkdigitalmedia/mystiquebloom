
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'requested',
  resolution_notes text,
  refund_amount_inr integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own returns" ON public.return_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users create own returns" ON public.return_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending returns" ON public.return_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'requested') WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage returns" ON public.return_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
