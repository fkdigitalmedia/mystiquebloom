
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image_url text;
