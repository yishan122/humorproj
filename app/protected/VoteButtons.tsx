"use client";

import { createClient } from "@/lib/supabase/browser";

export default function VoteButtons({ captionId }: { captionId: string }) {
  const supabase = createClient();

  const vote = async (value: number) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    const { error } = await supabase.from("caption_votes").upsert(
    {
        caption_id: captionId,
        profile_id: user.id,
        vote_value: value,
        created_datetime_utc: new Date().toISOString(),
    },
    { onConflict: "profile_id,caption_id" }
    );

    if (error) {
    console.error("vote error:", error);
    alert(JSON.stringify(error, null, 2));
    return;
    }

    alert("Vote recorded ✅");
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button onClick={() => vote(1)}>👍 Upvote</button>
      <button onClick={() => vote(-1)}>👎 Downvote</button>
    </div>
  );
}