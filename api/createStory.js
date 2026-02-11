export async function onRequestPost(context) {
  const { GITHUB_TOKEN } = context.env;

  if (!GITHUB_TOKEN) {
    return new Response("GitHub token missing", { status: 500 });
  }

  const { title, body, labels } = await context.request.json();

  const res = await fetch(
    "https://api.github.com/repos/BrigitaPVoll/User_Story_Library/issues",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, body, labels })
    }
  );

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: res.status
  });
}
