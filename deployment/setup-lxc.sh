#!/bin/bash
set -e

echo "=== LearnFlow LXC Setup ==="

apt-get update && apt-get install -y curl git nginx

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

cd /var/www/learnflow

echo "=== Backend Setup ==="
cd backend
cp .env.example .env
npm install
npm run build
npx tsx server.ts &
sleep 3
kill %1 2>/dev/null || true
cd ..

echo "=== Frontend Setup ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Nginx Setup ==="
cp deployment/nginx.conf /etc/nginx/sites-available/learnflow
ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== PM2 Setup ==="
cd backend
pm2 start ../deployment/ecosystem.config.js
pm2 save
pm2 startup

echo "=== Done ==="
echo "LearnFlow should now be running on port 80"
