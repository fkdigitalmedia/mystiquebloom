
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections public read" ON public.collections FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "collections admin all" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  subtitle text,
  description text,
  fragrance_family text,
  notes_top text[],
  notes_heart text[],
  notes_base text[],
  price_inr int NOT NULL,
  compare_at_price_inr int,
  volume_ml int,
  sku text,
  stock int NOT NULL DEFAULT 0,
  image_url text,
  gallery text[],
  rating numeric(2,1) DEFAULT 4.8,
  review_count int DEFAULT 0,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "products admin all" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist self" ON public.wishlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart self" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL DEFAULT ('MB-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  status text NOT NULL DEFAULT 'pending',
  subtotal_inr int NOT NULL,
  shipping_inr int NOT NULL DEFAULT 0,
  total_inr int NOT NULL,
  shipping_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders self read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders self insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price_inr int NOT NULL,
  quantity int NOT NULL,
  image_url text
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items self read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order_items insert with order" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

INSERT INTO public.collections (slug, name, tagline, description, sort_order) VALUES
  ('oud-reserve', 'The Oud Reserve', 'Rare aged oud from Assam & Cambodia', 'Twelve fragrances built around our most prized oud stocks — aged 12 to 25 years.', 1),
  ('rare-attars', 'Rare Attars', 'Hand-distilled traditional attars', 'Nine attars distilled in the traditional deg-bhapka method by master perfumers.', 2),
  ('royal-florals', 'Royal Florals', 'Rose, jasmine and tuberose', 'Fourteen floral compositions from the Kannauj rose fields and Grasse ateliers.', 3),
  ('spiced-orient', 'Spiced Orient', 'Warm, resinous and ambered', 'Eight fragrances built on saffron, cardamom, amber and myrrh.', 4);

INSERT INTO public.products (slug, name, subtitle, description, fragrance_family, notes_top, notes_heart, notes_base, price_inr, compare_at_price_inr, volume_ml, stock, image_url, rating, review_count, is_bestseller, is_new, collection_id)
VALUES
  ('midnight-oud','Midnight Oud','Eau de Parfum · 50ml','A meditative composition of Assam oud aged 18 years, smoked cedar and black amber.','Oud',ARRAY['Bergamot','Pink Pepper'],ARRAY['Assam Oud','Rose Absolute'],ARRAY['Amber','Sandalwood','Vetiver'],12500,15000,50,24,'/src/assets/product-1.jpg',4.9,128,true,false,(SELECT id FROM public.collections WHERE slug='oud-reserve')),
  ('rose-taif','Rose Taif','Eau de Parfum · 50ml','The legendary Taif rose petals distilled with Kannauri jasmine and a whisper of saffron.','Floral',ARRAY['Saffron','Pink Pepper'],ARRAY['Taif Rose','Jasmine Sambac'],ARRAY['White Musk','Sandalwood'],9800,NULL,50,40,'/src/assets/product-2.jpg',4.8,96,true,false,(SELECT id FROM public.collections WHERE slug='royal-florals')),
  ('amber-noir','Amber Noir','Extrait de Parfum · 30ml','Warm amber wrapped in tonka bean, vanilla absolute and Peruvian balsam.','Amber',ARRAY['Cardamom','Bergamot'],ARRAY['Amber','Tonka Bean'],ARRAY['Vanilla','Benzoin','Musk'],11200,13500,30,18,'/src/assets/product-3.jpg',4.9,74,true,true,(SELECT id FROM public.collections WHERE slug='spiced-orient')),
  ('cambodi-attar','Cambodi Attar','Pure Attar · 12ml','Traditional Cambodian oud attar distilled in copper degs. Sweet, resinous, transcendent.','Attar',ARRAY['Aged Oud'],ARRAY['Sandalwood','Musk'],ARRAY['Deer Musk','Resin'],18500,NULL,12,8,'/src/assets/product-4.jpg',5.0,52,false,true,(SELECT id FROM public.collections WHERE slug='rare-attars')),
  ('saffron-royale','Saffron Royale','Eau de Parfum · 50ml','Kashmiri saffron and leather over a warm amber base. Opulent and unmistakably regal.','Spice',ARRAY['Saffron','Elemi'],ARRAY['Leather','Rose'],ARRAY['Amber','Oud'],10500,NULL,50,30,'/src/assets/product-3.jpg',4.7,61,true,false,(SELECT id FROM public.collections WHERE slug='spiced-orient')),
  ('white-oud','White Oud','Eau de Parfum · 50ml','A luminous, powdery oud with iris, white amber and a soft musk drydown.','Oud',ARRAY['Iris','Bergamot'],ARRAY['White Oud','Orris'],ARRAY['White Amber','Musk'],13200,NULL,50,22,'/src/assets/product-1.jpg',4.8,88,false,true,(SELECT id FROM public.collections WHERE slug='oud-reserve')),
  ('jasmine-nuit','Jasmine Nuit','Eau de Parfum · 50ml','Night-blooming jasmine sambac layered with ylang and creamy sandalwood.','Floral',ARRAY['Neroli','Bergamot'],ARRAY['Jasmine Sambac','Ylang'],ARRAY['Sandalwood','Vanilla'],8900,NULL,50,45,'/src/assets/product-2.jpg',4.6,54,false,false,(SELECT id FROM public.collections WHERE slug='royal-florals')),
  ('musk-attar','Musk Attar','Pure Attar · 12ml','A silky white musk attar with rose absolute and a dry cedar base.','Attar',ARRAY['Rose'],ARRAY['White Musk'],ARRAY['Cedar','Amber'],14500,NULL,12,12,'/src/assets/product-4.jpg',4.9,39,false,false,(SELECT id FROM public.collections WHERE slug='rare-attars'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

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
 ARRAY['atelier','heritage'], true, now());
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value) VALUES (
  'homepage',
  '{
    "announcements": [
      "Complimentary shipping across India on orders above ₹5,000",
      "Discover our new Oud Reserve collection — hand-poured in Kannauj",
      "Bespoke gift boxes with hand-written inscriptions"
    ],
    "hero": {
      "eyebrow": "Maison Mystique · Est. 2019",
      "title": "The alchemy of scent, distilled.",
      "subtitle": "Rare oud, aged attars, and modern compositions — crafted in small batches for those who wear fragrance as a signature.",
      "primaryCtaLabel": "Explore Collections",
      "primaryCtaHref": "/shop",
      "secondaryCtaLabel": "The Atelier",
      "secondaryCtaHref": "/blog"
    },
    "brandStory": {
      "eyebrow": "The Atelier",
      "title": "A house devoted to the rarest raw materials.",
      "body": "From Assam agarwood to Kannauj rose, every ingredient is sourced at origin and aged for years before it meets the bottle. Our perfumers compose in the tradition of the great Eastern attar houses — patient, precise, uncompromising."
    },
    "newsletter": {
      "title": "The private list.",
      "body": "First access to limited editions, atelier notes, and invitations to private tastings.",
      "cta": "Subscribe"
    },
    "footerTagline": "Composed in India. Worn worldwide."
  }'::jsonb
);

CREATE POLICY "Product images public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Product images admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Product images admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Product images admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can view all coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert coupons"
  ON public.coupons FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coupons"
  ON public.coupons FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, active)
VALUES
  ('WELCOME10', 'Welcome offer — 10% off your first order', 'percent', 10, 0, true),
  ('MYSTIQUE500', 'Flat ₹500 off on orders above ₹5000', 'fixed', 500, 5000, true),
  ('LUXE15', '15% off on orders above ₹10000', 'percent', 15, 10000, true);
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (approved = true);

CREATE POLICY "Admins can view all reviews"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own reviews"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any review"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any review"
  ON public.product_reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX product_reviews_product_id_idx ON public.product_reviews(product_id);

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
REVOKE EXECUTE ON FUNCTION public.apply_order_loyalty() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image_url text;

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can submit messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit messages" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 200
    AND length(message) BETWEEN 1 AND 5000
  );
CREATE TABLE public.user_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX user_addresses_one_default_per_user
  ON public.user_addresses (user_id) WHERE is_default;

CREATE INDEX user_addresses_user_id_idx ON public.user_addresses (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;
GRANT ALL ON public.user_addresses TO service_role;

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses"
  ON public.user_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_role(auth.uid(), 'staff')
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs (actor_id);
CREATE POLICY "admins read carts" ON public.cart_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
CREATE POLICY "orders self cancel" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status IN ('pending','confirmed')) WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
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
CREATE POLICY "Users can view their own messages" ON public.contact_messages FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "Users delete own gift boxes" ON public.gift_boxes FOR DELETE TO authenticated USING (auth.uid() = user_id);

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
