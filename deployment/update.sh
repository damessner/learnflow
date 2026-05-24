#!/bin/bash
set -e
cd /var/www/learnflow

echo "=== LearnFlow Updater ==="

echo "Pulling latest changes..."
git pull origin main

echo "Building backend..."
cd backend
npm install --no-package-lock
npm run build
cd ..

echo "Building frontend..."
cd frontend
npm install --no-package-lock
npm run build
cd ..

echo "Reloading PM2..."
pm2 reload deployment/ecosystem.config.js --update-env
pm2 save

echo "=== Update complete ==="
