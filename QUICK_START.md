# Quick Start - GitHub Auto-Sync

## Step 1: Create GitHub Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `public_repo`
4. Copy the token

## Step 2: Add to Vercel
```bash
# In Vercel Dashboard → Settings → Environment Variables
GITHUB_USERNAME=your-username
GITHUB_PAT=ghp_yourtoken
```

## Step 3: Tag Your Repos
On GitHub, for each repo you want to display:
1. Go to repo → About (gear icon)
2. Add topics: `portfolio`, `typescript`, `react`, etc.
3. Save

## Step 4: Deploy
```bash
git add .
git commit -m "Add GitHub auto-sync"
git push
```

## Step 5: First Sync
Visit: `https://your-domain.vercel.app/api/sync/github`

Done! Your projects will now:
- Sync automatically daily at 3 AM
- Show on your portfolio with clickable tech filters
- Update whenever you change repo description/topics

## Test Locally (Optional)
```bash
# Add to .env.local
GITHUB_USERNAME=your-username
GITHUB_PAT=your-token

# Start dev server
npm run dev

# Test sync
curl http://localhost:3000/api/sync/github

# View projects
open http://localhost:3000/#projects
```

## Helpful Commands
```bash
# Test GitHub API connection
./scripts/test-github-api.sh your-username

# Manual sync after deployment
curl https://your-domain.vercel.app/api/sync/github

# View all projects
curl https://your-domain.vercel.app/api/projects

# Filter by tech
curl https://your-domain.vercel.app/api/projects?tech=typescript
```

## Troubleshooting
- No projects? → Check repos have `portfolio` topic
- 401 error? → Check `GITHUB_PAT` is set correctly
- Empty page? → Run manual sync first

Full docs: See `GITHUB_SYNC_SETUP.md`
