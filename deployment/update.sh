#!/bin/bash
set -e
cd /var/www/learnflow

echo "=== LearnFlow Updater ==="

echo "Pulling latest changes..."
# Preserve the live database across git pulls — it is intentionally not tracked
git update-index --assume-unchanged backend/data/learnflow.db 2>/dev/null || true
git update-index --assume-unchanged backend/data/learnflow.db-wal 2>/dev/null || true
git update-index --assume-unchanged backend/data/learnflow.db-shm 2>/dev/null || true
git stash --include-untracked -- backend/data/ 2>/dev/null || true
git pull origin main
git stash pop 2>/dev/null || true

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
