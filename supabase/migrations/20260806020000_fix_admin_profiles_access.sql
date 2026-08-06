-- Add email column to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Ensure authenticated users have full DML permissions on user_roles table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Helper function to check if user has admin/manager/staff access safely without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role IN ('admin'::public.app_role, 'manager'::public.app_role, 'staff'::public.app_role)
  ) THEN
    RETURN true;
  END IF;
  
  IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'goanews2068@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Helper function to check if user is strictly Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role = 'admin'::public.app_role
  ) THEN
    RETURN true;
  END IF;
  
  IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'goanews2068@gmail.com' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Drop existing restricted policies on profiles and user_roles
DROP POLICY IF EXISTS "profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and self read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and self read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super Admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own user_roles" ON public.user_roles;

-- Create comprehensive SELECT, INSERT, UPDATE policies for profiles
CREATE POLICY "Admins and self read profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid()) OR auth.uid() = id
);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

-- Create ALL policy for Super Admins ONLY on user_roles (allows SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super Admins manage user_roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Create SELECT policy for regular users to read their own roles
CREATE POLICY "Users read own user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

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
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin'::public.app_role) ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer'::public.app_role) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger is connected to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BACKFILL: Copy all existing auth.users (including Google OAuth signups) to public.profiles
INSERT INTO public.profiles (id, full_name, avatar_url, email)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  email
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

-- BACKFILL: Copy all existing auth.users to public.user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, CASE WHEN LOWER(email) = 'goanews2068@gmail.com' THEN 'admin'::public.app_role ELSE 'customer'::public.app_role END
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
