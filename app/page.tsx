import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
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