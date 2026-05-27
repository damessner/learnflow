#!/bin/bash
set -e
cd /var/www/learnflow

echo "=== LearnFlow Updater ==="

echo "Pulling latest changes..."
git pull origin main

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
