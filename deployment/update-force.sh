#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# LearnFlow Force Update
# USE THIS when "git pull" complains about local changes.
# It stashes everything, pulls fresh, rebuilds, and restarts.
# ──────────────────────────────────────────────────────────────────────────────
set -e

cd /var/www/learnflow

echo ""
echo "═══ LearnFlow Force Update ═══"
echo ""

# 1. Save .env if it exists (the one file you NEVER want to overwrite)
if [ -f backend/.env ]; then
  cp backend/.env /tmp/learnflow.env.bak
  echo "📦 Saved .env"
fi

# 2. Stash ALL local changes (git undoes everything else)
echo "📦 Stashing local changes..."
git stash --include-untracked

# 3. Pull the latest
echo "📦 Pulling latest from GitHub..."
git pull origin main

# 4. Restore .env (never lose this)
if [ -f /tmp/learnflow.env.bak ]; then
  cp /tmp/learnflow.env.bak backend/.env
  echo "📦 Restored .env"
  rm /tmp/learnflow.env.bak
fi

# 5. Preserve database
if [ -f backend/data/learnflow.db ]; then
  cp backend/data/learnflow.db /tmp/learnflow.db.bak
fi

# 6. Install dependencies
echo ""
echo "═══ Installing dependencies ═══"
npm install --no-package-lock 2>&1 | tail -1
cd backend
npm install --no-package-lock 2>&1 | tail -1
cd ..

# 7. Build backend
echo ""
echo "═══ Building backend ═══"
cd backend
npm run build 2>&1 | tail -3
cd ..

# 8. Build frontend
echo ""
echo "═══ Building frontend ═══"
cd frontend
npm install chart.js vue-chartjs 2>&1 | tail -1
npm run build 2>&1 | tail -3
cd ..

# 9. Restore database
if [ -f /tmp/learnflow.db.bak ]; then
  cp /tmp/learnflow.db.bak backend/data/learnflow.db
  rm /tmp/learnflow.db.bak
  echo "📦 Restored database"
fi

# 10. Restart PM2
echo ""
echo "═══ Restarting PM2 ═══"
if pm2 show learnflow &>/dev/null; then
  pm2 reload learnflow --update-env 2>&1 | tail -3
else
  pm2 start deployment/ecosystem.config.js --update-env 2>&1 | tail -3
fi
pm2 save 2>&1 | tail -1

echo ""
echo "═══ ✅ Update complete ═══"
echo ""
echo "Next time just run:  bash deployment/update-force.sh"
