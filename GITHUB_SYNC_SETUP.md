# GitHub Auto-Sync Setup Guide

This guide will help you set up automatic syncing of your GitHub repositories to your portfolio.

## 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Portfolio Sync"
4. Select scopes:
   - For public repos only: `public_repo`
   - For all repos: `repo`
5. Generate token and copy it (you won't see it again!)

## 2. Add Environment Variables

Add these to your Vercel project (or `.env.local` for local development):

```bash
GITHUB_USERNAME=your-github-username
GITHUB_PAT=ghp_yourpersonalaccesstoken
```

### In Vercel:
1. Go to your project → Settings → Environment Variables
2. Add `GITHUB_USERNAME` with your GitHub username
3. Add `GITHUB_PAT` with your personal access token
4. Make sure both are available for all environments (Production, Preview, Development)

## 3. Prepare Your GitHub Repositories

To control which repos appear on your portfolio, add the `portfolio` topic to repos you want to display:

1. Go to your GitHub repo
2. Click the gear icon next to "About"
3. Add `portfolio` to the Topics field
4. Save changes

**Alternative filter:** Repos with stars > 0 will also be included automatically.

## 4. Test the Sync Locally

```bash
# Install dependencies if needed
npm install

# Test the GitHub API sync
curl http://localhost:3000/api/sync/github

# Or visit in browser:
# http://localhost:3000/api/sync/github
```

You should see a JSON response like:
```json
{
  "success": true,
  "message": "Synced X projects from GitHub",
  "stats": {
    "total": 5,
    "created": 3,
    "updated": 2
  }
}
```

## 5. Test the Projects API

```bash
# Get all projects
curl http://localhost:3000/api/projects

# Filter by tech stack (topic)
curl http://localhost:3000/api/projects?tech=typescript
```

## 6. Deploy to Vercel

```bash
git add .
git commit -m "Add GitHub auto-sync"
git push
```

Vercel will automatically deploy your changes and set up the cron job.

## 7. Manual Sync Trigger

After deployment, you can manually trigger a sync by visiting:
```
https://your-domain.vercel.app/api/sync/github
```

## How It Works

1. **Cron Job**: Runs daily at 3:00 AM UTC
2. **Filtering**: Only includes repos that are:
   - Not forks
   - Not private
   - Have the `portfolio` topic OR have stars > 0
3. **Data Stored**:
   - Name, description
   - GitHub URL, homepage URL
   - Stars, forks, language
   - Topics (used as tech stack tags)
   - Created/updated dates

## Customizing

### Change Sync Schedule
Edit `vercel.json`:
```json
{
  "path": "/api/sync/github",
  "schedule": "0 3 * * *"  // Daily at 3 AM UTC
}
```

### Change Filter Logic
Edit `app/api/sync/github/route.ts`:
```typescript
const filteredRepos = repos.filter(
  (repo) =>
    !repo.fork &&
    !repo.private &&
    (repo.topics.includes('portfolio') || repo.stargazers_count > 0)
);
```

### Add Featured Projects
You can manually feature projects by updating the database:
```sql
UPDATE projects SET is_featured = true WHERE name = 'your-project-name';
```

## Troubleshooting

### No projects showing?
1. Check that `GITHUB_USERNAME` and `GITHUB_PAT` are set in Vercel
2. Verify the sync worked: visit `/api/sync/github`
3. Add the `portfolio` topic to your repos

### Rate limiting?
- Without token: 60 requests/hour
- With token: 5000 requests/hour
- Daily sync uses only 1 request

### Projects not updating?
- Wait for the next cron run (3 AM UTC)
- Or manually trigger: `/api/sync/github`
- Check Vercel logs for errors

## Tech Stack Tags

The topics from your GitHub repos become clickable filter tags on your portfolio. Best practices:

- Use lowercase
- Common examples: `typescript`, `react`, `nextjs`, `nodejs`, `python`
- Add the `portfolio` topic plus tech stack topics
- Example topics: `portfolio`, `typescript`, `nextjs`, `react`
