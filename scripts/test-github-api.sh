#!/bin/bash

# Test GitHub API Connection
# Usage: ./scripts/test-github-api.sh your-username [your-token]

USERNAME=${1:-$GITHUB_USERNAME}
TOKEN=${2:-$GITHUB_PAT}

if [ -z "$USERNAME" ]; then
    echo "Error: GitHub username required"
    echo "Usage: ./scripts/test-github-api.sh your-username [your-token]"
    exit 1
fi

echo "Testing GitHub API for user: $USERNAME"
echo "----------------------------------------"

# Build curl command
CURL_CMD="curl -s"
if [ -n "$TOKEN" ]; then
    CURL_CMD="$CURL_CMD -H 'Authorization: Bearer $TOKEN'"
    echo "Using authenticated request"
else
    echo "Using unauthenticated request (60 req/hour limit)"
fi

# Fetch repos
echo ""
echo "Fetching repositories..."
RESPONSE=$(eval "$CURL_CMD -H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28' 'https://api.github.com/users/$USERNAME/repos?per_page=10&sort=updated'")

# Check for errors
if echo "$RESPONSE" | grep -q "message"; then
    echo "Error from GitHub API:"
    echo "$RESPONSE" | grep "message"
    exit 1
fi

# Parse and display repos
echo ""
echo "Recent repositories:"
echo "==================="
echo "$RESPONSE" | jq -r '.[] | "\(.name) - \(.description // "No description") - Topics: \(.topics | join(", "))"'

# Count repos with portfolio topic
PORTFOLIO_COUNT=$(echo "$RESPONSE" | jq '[.[] | select(.topics | contains(["portfolio"]))] | length')
STARRED_COUNT=$(echo "$RESPONSE" | jq '[.[] | select(.stargazers_count > 0)] | length')

echo ""
echo "Statistics:"
echo "==========="
echo "Repos with 'portfolio' topic: $PORTFOLIO_COUNT"
echo "Repos with stars: $STARRED_COUNT"

echo ""
echo "Rate limit status:"
echo "=================="
eval "$CURL_CMD 'https://api.github.com/rate_limit'" | jq '.rate'
