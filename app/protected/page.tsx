import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main style={{ padding: 24 }}>
      <h1>Gated UI ✅</h1>
      <p>Signed in as: {data.user.email}</p>
    </main>
  );
}
