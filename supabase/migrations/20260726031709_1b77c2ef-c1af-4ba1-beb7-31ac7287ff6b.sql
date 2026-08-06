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