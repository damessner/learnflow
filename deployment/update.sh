#!/bin/bash
set -e
cd /var/www/learnflow

echo "=== LearnFlow Updater ==="

echo "Pulling latest changes..."
# Preserve the live database — backup, remove (git may still track it from old history), pull, restore
if [ -f backend/data/learnflow.db ]; then
  cp backend/data/learnflow.db /tmp/learnflow.db.bak
  rm -f backend/data/learnflow.db
fi
git pull origin main
if [ -f /tmp/learnflow.db.bak ]; then
  cp /tmp/learnflow.db.bak backend/data/learnflow.db
  rm -f /tmp/learnflow.db.bak
fi

echo "Setting up Nginx (if not already configured)..."
if [ ! -f /etc/nginx/sites-available/learnflow ]; then
  sudo cp deployment/nginx.conf /etc/nginx/sites-available/learnflow
fi
if [ ! -L /etc/nginx/sites-enabled/learnflow ]; then
  sudo ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
fi
if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi
sudo nginx -t && sudo systemctl reload nginx

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
