
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS courier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.stamp_order_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN NEW.confirmed_at := now(); END IF;
    IF NEW.status = 'shipped' AND NEW.shipped_at IS NULL THEN NEW.shipped_at := now(); END IF;
    IF NEW.status = 'out_for_delivery' AND NEW.out_for_delivery_at IS NULL THEN NEW.out_for_delivery_at := now(); END IF;
    IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN NEW.delivered_at := now(); END IF;
    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN NEW.cancelled_at := now(); END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN NEW.confirmed_at := now(); END IF;
    IF NEW.status = 'shipped' AND NEW.shipped_at IS NULL THEN NEW.shipped_at := now(); END IF;
    IF NEW.status = 'out_for_delivery' AND NEW.out_for_delivery_at IS NULL THEN NEW.out_for_delivery_at := now(); END IF;
    IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN NEW.delivered_at := now(); END IF;
    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN NEW.cancelled_at := now(); END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_stamp_status ON public.orders;
CREATE TRIGGER trg_orders_stamp_status
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.stamp_order_status_timestamps();

-- Backfill for existing orders
UPDATE public.orders SET confirmed_at = COALESCE(confirmed_at, created_at) WHERE status IN ('confirmed','shipped','out_for_delivery','delivered');
UPDATE public.orders SET shipped_at = COALESCE(shipped_at, created_at) WHERE status IN ('shipped','out_for_delivery','delivered');
UPDATE public.orders SET delivered_at = COALESCE(delivered_at, created_at) WHERE status = 'delivered';
UPDATE public.orders SET cancelled_at = COALESCE(cancelled_at, created_at) WHERE status = 'cancelled';
