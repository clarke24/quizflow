#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-quizflow}"
GITHUB_OWNER="${GITHUB_OWNER:-}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Missing GITHUB_TOKEN. Create one at https://github.com/settings/tokens (repo scope)."
  exit 1
fi

export GH_TOKEN="$GITHUB_TOKEN"

if [[ -z "$GITHUB_OWNER" ]]; then
  GITHUB_OWNER=$(gh api user -q .login)
fi

echo "Creating GitHub repo ${GITHUB_OWNER}/${REPO_NAME}..."
if ! gh repo view "${GITHUB_OWNER}/${REPO_NAME}" &>/dev/null; then
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push --description "QuizFlow — interactive team quizzes with QR join"
else
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"
  git push -u origin HEAD:main
fi

echo "GitHub repo ready: https://github.com/${GITHUB_OWNER}/${REPO_NAME}"

if [[ -n "${RAILWAY_TOKEN:-}" ]]; then
  echo "Deploying to Railway..."
  export RAILWAY_TOKEN
  npx railway login --token "$RAILWAY_TOKEN"
  npx railway init --name "$REPO_NAME" 2>/dev/null || true
  npx railway up --detach
  echo "Check your Railway dashboard for the live URL."
else
  echo "No RAILWAY_TOKEN set. Connect the GitHub repo in Railway dashboard:"
  echo "  1. Go to https://railway.com/new"
  echo "  2. Deploy from GitHub repo → ${REPO_NAME}"
  echo "  3. Railway auto-detects Next.js and deploys"
fi
