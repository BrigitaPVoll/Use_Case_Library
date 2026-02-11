export async function onRequestPost(context) {
  const { TOKEN } = context.env;

  // Get token from environment or Authorization header
  let token = TOKEN;
  const authHeader = context.request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing GitHub token',
        message: 'GitHub token not found in environment or Authorization header'
      }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { title, body, labels } = await context.request.json();

    if (!title || !title.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error',
          message: 'Title is required'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const res = await fetch(
      "https://api.github.com/repos/BrigitaPVoll/User_Story_Library/issues",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "Use_Case_Library_Web"
        },
        body: JSON.stringify({ 
          title: title.trim(),
          body: body || '',
          labels: Array.isArray(labels) ? labels : (labels ? labels.split(',').map(l => l.trim()) : [])
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('GitHub API error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'GitHub API error',
          status: res.status,
          message: data.message || `${res.status} ${res.statusText}`
        }), 
        { 
          status: res.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (err) {
    console.error('Error in createStory:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        message: err.message || 'Failed to create story'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
