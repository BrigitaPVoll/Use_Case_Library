# User Story Library Setup Guide

This guide explains how to set up and deploy the User Story Library web application that allows creating new user stories directly from the webpage to GitHub.

## 🏗️ Project Structure

```
Use_Case_Library/
├── .github/
│   └── index.html          # Main web interface
├── api/
│   └── createStory.js      # Backend API for creating GitHub issues
├── wrangler.toml           # Cloudflare Workers configuration
├── README.md               # Project overview
└── SETUP.md                # This file
```

## 📋 Prerequisites

1. **GitHub Account** - with a repository to store user stories
2. **Cloudflare Account** - for hosting the API (free tier available)
3. **GitHub Personal Access Token** - for creating issues programmatically

## 🔑 Getting a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** (Classic)
3. Give it a name like "User Story Library"
4. Select scopes:
   - For public repo: `public_repo`
   - For private repo: `repo`
5. Click **"Generate token"**
6. **Save it somewhere safe** (you won't see it again)

## 🚀 Deployment Options

### Option 1: Cloudflare Workers (Recommended - Free)

#### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

#### Step 2: Configure Environment
Create a `.env.production` file at the root:
```
GITHUB_TOKEN=ghp_your_token_here
```

#### Step 3: Deploy
```bash
wrangler deploy
```

The API will be available at: `https://your-project.workers.dev/api/createStory`

### Option 2: Self-Hosted (Node.js + Express)

#### Step 1: Initialize Project
```bash
npm init -y
npm install express dotenv cors
```

#### Step 2: Create `server.js`
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static HTML
app.use(express.static('.github'));

// API endpoint
app.post('/api/createStory', async (req, res) => {
  const { title, body, labels } = req.body;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const response = await fetch(
      "https://api.github.com/repos/BrigitaPVoll/User_Story_Library/issues",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, body, labels })
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

#### Step 3: Run Locally
```bash
node server.js
```

## 🔐 Setting Token in the Web Interface

### For Development (Browser Storage)
1. Open the webpage
2. Click **"Token"** button in the header
3. Paste your GitHub Personal Access Token
4. It will be stored in browser localStorage

### For Production (Environment Variable)
The backend API should have the token configured in environment variables:
- Cloudflare Workers: Set in `wrangler.toml` secrets
- Node.js: Set in `.env` file
- Vercel/Netlify: Set in dashboard

## 📝 Creating a User Story

1. Click **"New Story"** button
2. Fill in the form:
   - **Title** (required): Descriptive title of the user story
   - **As a...** (required): The role/persona
   - **I want to...** (required): The goal/action
   - **...so that I can...** (optional): The benefit/outcome
   - **Additional context**: Any extra details
   - **Contact consent**: Can we contact you?
   - **Labels**: Comma-separated GitHub labels (default: "user-story")
   - **Point of Contact**: Name or email for follow-up
3. Click **"Create Story"**
4. The issue will be created in GitHub automatically

## 🔄 How It Works

1. User fills out the form in the browser
2. Frontend sends data to `/api/createStory` endpoint
3. Backend receives request + token from Authorization header
4. Backend creates a GitHub issue with the story data
5. GitHub returns the created issue
6. Frontend displays success and refreshes the list

## 📊 Viewing Created Stories

Stories are automatically displayed on the main page:
- Filter by **State**: Open, Closed, or All
- **Search** by title, story description, or context
- **Only valid stories** checkbox to show template-compliant entries
- **Export to CSV** for bulk analysis
- **Print/Save as PDF** for offline viewing

## 🐛 Troubleshooting

### "401 Unauthorized" Error
- **Check token**: Make sure it's valid and not expired
- **Check scopes**: Token needs `public_repo` or `repo` access
- **Frontend vs Backend**: If using backend, verify token is in environment variables

### "403 Forbidden" Error
- **Rate limited**: GitHub limits API calls to 60/hour unauthenticated, 5000/hour with token
- **Wait**: Usually resolves itself in ~1 hour
- **Check token scopes**: Ensure token has repo access

### No stories appearing
- Click **"Refresh"** to reload data
- Check URL in backend link matches your repo: `BrigitaPVoll/User_Story_Library`
- Ensure GitHub token has read access

### Token not saving
- Check browser console for errors
- Ensure localStorage is enabled
- Try incognito/private mode to test

## 🔒 Security Notes

- **Never commit tokens** to git (use `.gitignore`)
- **Only share tokens** over secure channels
- **Rotate tokens** periodically for production
- **Use scoped tokens** with minimal necessary permissions
- **For public repos**: `public_repo` scope is sufficient
- **For private repos**: `repo` scope is required

## 📚 API Endpoint Reference

### POST `/api/createStory`

**Request:**
```json
{
  "title": "Story title",
  "body": "Issue body with formatting",
  "labels": ["user-story", "bug"]
}
```

**Headers:**
```
Authorization: Bearer ghp_your_token_here
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "id": 123456,
  "number": 42,
  "title": "Story title",
  "body": "Issue body with formatting",
  "state": "open",
  "html_url": "https://github.com/...",
  ...
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token lacks permissions or rate limited
- `500 Server Error`: Server-side issue

## 🎯 Next Steps

1. ✅ Deploy the API (choose Option 1 or 2 above)
2. ✅ Update `index.html` domain/path if needed
3. ✅ Test creating a story
4. ✅ Verify it appears in your GitHub repository
5. ✅ Share the webpage link with users

## 📞 Support

For issues with:
- **GitHub API**: Check [GitHub API docs](https://docs.github.com/rest)
- **Cloudflare Workers**: See [Wrangler docs](https://developers.cloudflare.com/workers/)
- **Frontend**: Check browser console for errors (F12)
