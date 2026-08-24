# QuizFlow

Interactive team quiz platform. Create quizzes, share a QR code, and let players join with a name and team.

## Features

- Quiz builder with multiple choice and true/false questions
- QR code + 6-character join code for players
- Team creation and live leaderboard
- Host dashboard to control the quiz flow
- Mobile-friendly player experience

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.com/new](https://railway.com/new) → **Deploy from GitHub repo**
3. Select this repo — Railway auto-detects Next.js
4. Once deployed, open the generated URL on your phone

Or use the deploy script (requires `GITHUB_TOKEN` and optionally `RAILWAY_TOKEN`):

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh quizflow
```

## How to use

1. **Host:** Visit `/create` → build quiz → launch session
2. **Share:** Show QR code on the host screen
3. **Players:** Scan QR → enter name → pick/create team
4. **Play:** Host starts quiz, players answer live, teams compete
