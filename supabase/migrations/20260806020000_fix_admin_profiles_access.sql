-- Add email column to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Drop existing restricted SELECT policies on profiles and user_roles
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and self read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and self read user_roles" ON public.user_roles;

-- Create comprehensive SELECT policies for profiles (Admins see all, users see self)
CREATE POLICY "Admins and self read profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR auth.uid() = id
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'goanews2068@gmail.com'
);

-- Create comprehensive SELECT policies for user_roles
CREATE POLICY "Admins and self read user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR auth.uid() = user_id
  OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'goanews2068@gmail.com'
);

-- Update handle_new_user trigger to save email into profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email;
  
  IF LOWER(NEW.email) = 'goanews2068@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
