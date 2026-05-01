import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Configuration required</h1>
        <p>Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_snippets")
    .select("*")
    .limit(10);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>News Snippets</h1>
      <ul>
        {data?.map((item) => (
          <li key={item.id} style={{ marginBottom: 12 }}>
            <strong>{item.headline}</strong>
            <div>{item.category}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
