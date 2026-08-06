
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_earned integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_redeemed integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_inr numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.apply_order_loyalty()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  earned int;
BEGIN
  earned := GREATEST(0, floor(COALESCE(NEW.total_inr,0) / 100))::int;
  NEW.points_earned := earned;
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
      SET loyalty_points = GREATEST(0, loyalty_points - COALESCE(NEW.points_redeemed,0)) + earned
      WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_apply_loyalty ON public.orders;
CREATE TRIGGER orders_apply_loyalty
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.apply_order_loyalty();
