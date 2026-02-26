"use client";

import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = createClient();

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, 
      },
    });
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <button onClick={signIn} style={{ padding: 12 }}>
        Sign in with Google
      </button>
    </main>
  );
}
