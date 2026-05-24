#!/bin/bash
set -e

# Custom colors for console formatting
export NC='\e[0m'
export BOLD='\e[1m'
export PURPLE='\e[1;35m'
export CYAN='\e[1;36m'
export GREEN='\e[1;32m'
export YELLOW='\e[1;33m'
export BLUE='\e[1;34m'
export RED='\e[1;31m'

echo -e "${PURPLE}${BOLD}=================================================================${NC}"
echo -e "${CYAN}${BOLD}         🚀 Welcome to the LearnFlow Proxmox LXC Setup 🚀         ${NC}"
echo -e "${PURPLE}${BOLD}=================================================================${NC}"
echo ""

export DEBIAN_FRONTEND=noninteractive
echo -e "${BLUE}📦 Configuring system locales...${NC}"
apt-get update && apt-get install -y locales >/dev/null 2>&1
sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen 2>/dev/null || true
dpkg-reconfigure --frontend=noninteractive locales 2>/dev/null || true
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo -e "${BLUE}📦 Installing standard system dependencies (git, curl, nginx)...${NC}"
apt-get install -y curl git nginx >/dev/null 2>&1
apt-get dist-upgrade -y >/dev/null 2>&1

if ! command -v node &> /dev/null; then
  echo -e "${BLUE}🟢 Node.js not found. Installing Node.js v22 (LTS)...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y nodejs >/dev/null 2>&1
fi

# Clean npm console alerts
npm config set fund false
npm config set update-notifier false

echo -e "${BLUE}⚙️ Installing PM2 global process manager...${NC}"
npm install -g pm2 >/dev/null 2>&1

cd /var/www/learnflow

echo -e "${CYAN}⚡ Setting up TypeScript & Knex Backend Server...${NC}"
cd backend
cp .env.example .env
echo -e "  └─ Installing npm packages..."
npm install --no-package-lock >/dev/null 2>&1
echo -e "  └─ Building TS server..."
npm run build >/dev/null 2>&1
# Dry run server boot to create initial databases
npx tsx server.ts &
sleep 4
kill %1 2>/dev/null || true
cd ..

echo -e "${CYAN}🎨 Building Vue 3 & Vite Frontend Web Application...${NC}"
cd frontend
echo -e "  └─ Installing npm packages..."
npm install --no-package-lock >/dev/null 2>&1
echo -e "  └─ Compiling production bundles (Vite)...${NC}"
npm run build >/dev/null 2>&1
cd ..

echo -e "${BLUE}🔧 Configuring Nginx HTTP Reverse Proxy...${NC}"
cp deployment/nginx.conf /etc/nginx/sites-available/learnflow
ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${BLUE}🔥 Starting daemonized backend server under PM2...${NC}"
cd backend
pm2 start ../deployment/ecosystem.config.js >/dev/null 2>&1
pm2 save >/dev/null 2>&1
pm2 startup >/dev/null 2>&1

echo -e "${BLUE}💡 Setting up dynamic terminal welcome message...${NC}"
cat << 'EOF' > /etc/profile.d/learnflow.sh
#!/bin/bash
# Dynamic welcome dashboard for LearnFlow LXC container logins

IP_ADDR=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDR" ]; then
  IP_ADDR="localhost"
fi

# Print beautiful welcome ASCII banner
echo -e "\e[1;35m"
echo "  _       ______   ___   ______  _   __  ______  __      ____  _      __ "
echo " | |     / ____/  /   | / __  / | | / / / ____/ / /     / __ \ | |    / / "
echo " | |    / __/    / /| |/ /_/ /  | |/ / / __/   / /     / / / /  \ \  / /  "
echo " | |___/ /___   / ___ / __  _   |   / / /___  / /___  / /_/ /    \ \/ /   "
echo " |____/_____/  /_/  |_/_/ \_\   |__/ /_____/ /_____/  \____/      \_/     "
echo -e "\e[0m"

echo -e "\e[1;34m=================================================================\e[0m"
echo -e "\e[1;32m   🎉  Congratulations! LearnFlow is deployed and fully active! \e[0m"
echo -e "\e[1;34m=================================================================\e[0m"
echo -e "  \e[1;36m🌐 Web App Address:\e[0m      \e[1;33mhttp://${IP_ADDR}/\e[0m"
echo -e "  \e[1;36m📱 PWA / Intune Clip:\e[0m    \e[1;33mhttp://${IP_ADDR}/\e[0m"
echo -e "  \e[1;36m📁 Teams App Source:\e[0m     /var/www/learnflow/teams-app"
echo -e "  \e[1;36m📊 Backend Service:\e[0m      Running on port 3001 (managed by PM2)"
echo -e "\e[1;34m=================================================================\e[0m"
echo -e "  \e[1;33m💡 Quick Commands:\e[0m"
echo -e "     • Re-compile Teams App ZIP:"
echo -e "       \e[1;32mcd /var/www/learnflow/teams-app && node package-teams.js http://${IP_ADDR}\e[0m"
echo -e "     • Inspect backend server status:   \e[1;32mpm2 status\e[0m"
echo -e "     • View live backend log streams:   \e[1;32mpm2 logs learnflow\e[0m"
echo -e "\e[1;34m=================================================================\e[0m"
echo ""
EOF
chmod +x /etc/profile.d/learnflow.sh

echo ""
echo -e "${GREEN}${BOLD}=================================================================${NC}"
echo -e "${GREEN}${BOLD}     🎉 SUCCESS! LearnFlow is successfully installed and run!   ${NC}"
echo -e "${GREEN}${BOLD}=================================================================${NC}"
echo -e "  - Open in browser: ${YELLOW}${BOLD}http://<your-container-ip>/${NC}"
echo -e "  - Login to LXC console to view dynamic credentials & app commands!"
echo -e "${GREEN}${BOLD}=================================================================${NC}"
echo ""
