DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "profiles self insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.collections (
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
DROP POLICY IF EXISTS "collections public read" ON public.collections;
DROP POLICY IF EXISTS "collections admin all" ON public.collections;
CREATE POLICY "collections public read" ON public.collections FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "collections admin all" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.products (
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
DROP POLICY IF EXISTS "products public read" ON public.products;
DROP POLICY IF EXISTS "products admin all" ON public.products;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "products admin all" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlist self" ON public.wishlist;
CREATE POLICY "wishlist self" ON public.wishlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.cart_items (
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
DROP POLICY IF EXISTS "cart self" ON public.cart_items;
CREATE POLICY "cart self" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.orders (
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
DROP POLICY IF EXISTS "orders self read" ON public.orders;
DROP POLICY IF EXISTS "orders self insert" ON public.orders;
DROP POLICY IF EXISTS "orders admin update" ON public.orders;
CREATE POLICY "orders self read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders self insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.order_items (
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
DROP POLICY IF EXISTS "order_items self read" ON public.order_items;
DROP POLICY IF EXISTS "order_items insert with order" ON public.order_items;
CREATE POLICY "order_items self read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order_items insert with order" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

INSERT INTO public.collections (slug, name, tagline, description, sort_order) VALUES
  ('oud-reserve', 'The Oud Reserve', 'Rare aged oud from Assam & Cambodia', 'Twelve fragrances built around our most prized oud stocks — aged 12 to 25 years.', 1),
  ('rare-attars', 'Rare Attars', 'Hand-distilled traditional attars', 'Nine attars distilled in the traditional deg-bhapka method by master perfumers.', 2),
  ('royal-florals', 'Royal Florals', 'Rose, jasmine and tuberose', 'Fourteen floral compositions from the Kannauj rose fields and Grasse ateliers.', 3),
  ('spiced-orient', 'Spiced Orient', 'Warm, resinous and ambered', 'Eight fragrances built on saffron, cardamom, amber and myrrh.', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (slug, name, subtitle, description, fragrance_family, notes_top, notes_heart, notes_base, price_inr, compare_at_price_inr, volume_ml, stock, image_url, rating, review_count, is_bestseller, is_new, collection_id)
VALUES
  ('midnight-oud','Midnight Oud','Eau de Parfum · 50ml','A meditative composition of Assam oud aged 18 years, smoked cedar and black amber.','Oud',ARRAY['Bergamot','Pink Pepper'],ARRAY['Assam Oud','Rose Absolute'],ARRAY['Amber','Sandalwood','Vetiver'],12500,15000,50,24,'/src/assets/product-1.jpg',4.9,128,true,false,(SELECT id FROM public.collections WHERE slug='oud-reserve')),
  ('rose-taif','Rose Taif','Eau de Parfum · 50ml','The legendary Taif rose petals distilled with Kannauri jasmine and a whisper of saffron.','Floral',ARRAY['Saffron','Pink Pepper'],ARRAY['Taif Rose','Jasmine Sambac'],ARRAY['White Musk','Sandalwood'],9800,NULL,50,40,'/src/assets/product-2.jpg',4.8,96,true,false,(SELECT id FROM public.collections WHERE slug='royal-florals')),
  ('amber-noir','Amber Noir','Extrait de Parfum · 30ml','Warm amber wrapped in tonka bean, vanilla absolute and Peruvian balsam.','Amber',ARRAY['Cardamom','Bergamot'],ARRAY['Amber','Tonka Bean'],ARRAY['Vanilla','Benzoin','Musk'],11200,13500,30,18,'/src/assets/product-3.jpg',4.9,74,true,true,(SELECT id FROM public.collections WHERE slug='spiced-orient')),
  ('cambodi-attar','Cambodi Attar','Pure Attar · 12ml','Traditional Cambodian oud attar distilled in copper degs. Sweet, resinous, transcendent.','Attar',ARRAY['Aged Oud'],ARRAY['Sandalwood','Musk'],ARRAY['Deer Musk','Resin'],18500,NULL,12,8,'/src/assets/product-4.jpg',5.0,52,false,true,(SELECT id FROM public.collections WHERE slug='rare-attars')),
  ('saffron-royale','Saffron Royale','Eau de Parfum · 50ml','Kashmiri saffron and leather over a warm amber base. Opulent and unmistakably regal.','Spice',ARRAY['Saffron','Elemi'],ARRAY['Leather','Rose'],ARRAY['Amber','Oud'],10500,NULL,50,30,'/src/assets/product-3.jpg',4.7,61,true,false,(SELECT id FROM public.collections WHERE slug='spiced-orient')),
  ('white-oud','White Oud','Eau de Parfum · 50ml','A luminous, powdery oud with iris, white amber and a soft musk drydown.','Oud',ARRAY['Iris','Bergamot'],ARRAY['White Oud','Orris'],ARRAY['White Amber','Musk'],13200,NULL,50,22,'/src/assets/product-1.jpg',4.8,88,false,true,(SELECT id FROM public.collections WHERE slug='oud-reserve')),
  ('jasmine-nuit','Jasmine Nuit','Eau de Parfum · 50ml','Night-blooming jasmine sambac layered with ylang and creamy sandalwood.','Floral',ARRAY['Neroli','Bergamot'],ARRAY['Jasmine Sambac','Ylang'],ARRAY['Sandalwood','Vanilla'],8900,NULL,50,45,'/src/assets/product-2.jpg',4.6,54,false,false,(SELECT id FROM public.collections WHERE slug='royal-florals')),
  ('musk-attar','Musk Attar','Pure Attar · 12ml','A silky white musk attar with rose absolute and a dry cedar base.','Attar',ARRAY['Rose'],ARRAY['White Musk'],ARRAY['Cedar','Amber'],14500,NULL,12,12,'/src/assets/product-4.jpg',4.9,39,false,false,(SELECT id FROM public.collections WHERE slug='rare-attars'))
ON CONFLICT (slug) DO NOTHING;
