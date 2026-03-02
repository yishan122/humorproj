import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VoteButtons from "./VoteButtons";
import UploadBox from "./UploadBox";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const { data: sessionData } = await supabase.auth.getSession();
  console.log("session?", sessionData.session?.access_token?.slice(0, 20));

  if (!data.user) redirect("/login");

  // captions
  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
  }

return (
  <main style={{ padding: 24 }}>
    <h1>Gated UI ✅</h1>
    <p>Signed in as: {data.user.email}</p>
    <UploadBox />

    <hr style={{ margin: "24px 0" }} />

    <h2>Captions</h2>

    {captions?.map((caption) => (
      <div
        key={caption.id}
        style={{
          padding: 16,
          border: "1px solid #333",
          marginBottom: 16,
        }}
      >
        <p>{caption.content}</p>
        <VoteButtons captionId={caption.id} />
      </div>
    ))}
  </main>
  );
}