
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  body TEXT NOT NULL,
  author TEXT DEFAULT 'Mystique Atelier',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.gift_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  recipient_name TEXT,
  message TEXT,
  box_style TEXT NOT NULL DEFAULT 'signature',
  occasion TEXT,
  product_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_boxes TO authenticated;
GRANT ALL ON public.gift_boxes TO service_role;
ALTER TABLE public.gift_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own gift boxes" ON public.gift_boxes FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own gift boxes" ON public.gift_boxes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gift boxes" ON public.gift_boxes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gift boxes" ON public.gift_boxes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_gift_boxes_updated_at BEFORE UPDATE ON public.gift_boxes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.blog_posts (slug, title, excerpt, cover_image, body, tags, published, published_at) VALUES
('the-soul-of-oud',
 'The Soul of Oud: A Journey Through Liquid Gold',
 'From ancient Assam forests to modern parfumerie, discover why oud remains the most coveted essence in the world.',
 '/src/assets/atelier.jpg',
 E'# The Soul of Oud\n\nFew ingredients carry the mystique of oud. Formed only when Aquilaria trees are wounded and infected with a rare mould, the resulting resin — agarwood — is distilled into an oil more precious than gold by weight.\n\n## Origins\n\nOur master perfumers source oud from three legendary regions: **Assam** for its leathery depth, **Cambodia** for smoky sweetness, and **Trat** for animalic warmth. Each vintage is aged for a minimum of seven years.\n\n## The Craft\n\nEvery drop passes through a hydro-distillation process refined over centuries. The result is a fragrance with unparalleled longevity — a signature that becomes uniquely yours as it develops on the skin.\n\n> "Oud is not worn. It is inhabited." — Mystique Atelier',
 ARRAY['oud','craftsmanship','ingredients'], true, now()),
('the-art-of-layering',
 'The Art of Layering: Composing Your Signature',
 'A masterclass in building depth, contrast, and personal narrative through fragrance layering.',
 '/src/assets/hero-bottle.jpg',
 E'# The Art of Layering\n\nLayering is the secret language of fragrance connoisseurs. When done with intention, it creates a scent that belongs only to you.\n\n## The Foundation\n\nBegin with a rich, resinous base — an oud, an amber, or a musk. This anchors the composition and provides longevity.\n\n## The Heart\n\nAdd a floral or spice accord to introduce movement. Rose atop oud is timeless; saffron atop amber, transcendent.\n\n## The Signature\n\nFinish with a bright citrus or aromatic touch on the pulse points. This is what people notice as you enter a room.',
 ARRAY['guides','layering'], true, now()),
('inside-the-atelier',
 'Inside the Atelier: Where Time Slows Down',
 'A rare glimpse into the Mystique workshop, where each bottle is filled, sealed, and inscribed by hand.',
 '/src/assets/gift-box.jpg',
 E'# Inside the Atelier\n\nBehind an unmarked door in old Kannauj, our atelier operates the way perfumeries have for four hundred years.\n\n## By Hand\n\nEvery bottle is filled by a single artisan who signs the base with a numbered seal. Our maximum production is 800 bottles per composition, per year.\n\n## Aged in Copper\n\nOur macerations rest in hand-hammered copper vessels — an ancestral choice that softens harsh notes and coaxes forth the fragrance''s truest character.\n\n## An Invitation\n\nBy appointment, patrons may visit the atelier and commission a bespoke fragrance built to their olfactory portrait.',
 ARRAY['atelier','heritage'], true, now())
ON CONFLICT (slug) DO NOTHING;
