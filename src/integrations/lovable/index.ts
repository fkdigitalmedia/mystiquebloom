import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      const supabaseProvider = provider === "microsoft" ? "azure" : provider === "lovable" ? "google" : provider;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as "google" | "apple" | "azure",
        options: {
          redirectTo: opts?.redirect_uri ?? (typeof window !== "undefined" ? window.location.origin : undefined),
          queryParams: opts?.extraParams,
        },
      });

      if (error) {
        return { error };
      }

      if (data?.url) {
        if (typeof window !== "undefined") {
          window.location.href = data.url;
        }
        return { redirected: true };
      }

      return { redirected: false };
    },
  },
};
