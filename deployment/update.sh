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
pm2 reload learnflow --update-env
pm2 save

echo "=== Update complete ==="
