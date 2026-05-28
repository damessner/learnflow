#!/bin/bash
set -e
cd /var/www/learnflow

echo "=== LearnFlow Updater ==="
echo ""

# ── Force mode ──────────────────────────────────────────────────────────
# If --force or -f is passed, stash all local changes before pulling.
# This avoids "your local changes would be overwritten" errors.
FORCE=false
if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
  FORCE=true
  echo "⚠ Force mode: stashing all local changes..."
fi

echo "Pulling latest changes..."
# Preserve .env file
if [ -f backend/.env ]; then
  cp backend/.env /tmp/learnflow.env.bak
fi

# Stash local changes in force mode
if [ "$FORCE" = true ]; then
  git stash --include-untracked 2>/dev/null || true
fi

# Preserve the live database — backup, remove (git may still track it from old history), pull, restore
if [ -f backend/data/learnflow.db ]; then
  cp backend/data/learnflow.db /tmp/learnflow.db.bak
fi
git pull origin main
# Restore .env
if [ -f /tmp/learnflow.env.bak ]; then
  cp /tmp/learnflow.env.bak backend/.env
  rm /tmp/learnflow.env.bak
fi
if [ -f /tmp/learnflow.db.bak ]; then
  cp /tmp/learnflow.db.bak backend/data/learnflow.db
  rm -f /tmp/learnflow.db.bak
fi

echo "Setting up Nginx (if not already configured)..."
# Detect whether we need sudo (running as root in LXC? use plain commands)
SUDO=""
if command -v sudo &>/dev/null && [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi
# Copy config if missing
$SUDO cp -n deployment/nginx.conf /etc/nginx/sites-available/learnflow 2>/dev/null || true
# Enable site (idempotent)
$SUDO ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
# Remove default site so ours takes priority
$SUDO rm -f /etc/nginx/sites-enabled/default
# Validate and reload
if $SUDO nginx -t 2>/dev/null; then
  $SUDO systemctl reload nginx 2>/dev/null || $SUDO nginx -s reload 2>/dev/null || true
  echo "✓ Nginx configured and reloaded"
else
  echo "⚠ Nginx config test failed — check /etc/nginx/sites-available/learnflow"
fi

echo "Installing dependencies..."
npm install --no-package-lock

echo "Building backend..."
cd backend
npm run build
cd ..

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Reloading PM2..."
# Start if first run, reload otherwise — works out of the box
if pm2 show learnflow &>/dev/null; then
  pm2 reload learnflow --update-env
else
  pm2 start deployment/ecosystem.config.js --update-env
fi
pm2 save

echo "=== Update complete ==="
