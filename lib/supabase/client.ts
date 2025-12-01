import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

// Basic client for public/anonymous access (no authentication)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Hook to create authenticated Supabase client with Clerk JWT
// Use this for operations that require RLS policies to identify the user
export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        accessToken: async () => {
          // Get Clerk token with Supabase template
          return session?.getToken({ template: "supabase" }) ?? null;
        },
      }
    );
  }, [session]);
}
