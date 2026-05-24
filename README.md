# LearnFlow - Active Recall & Spaced Repetition Learning Platform

LearnFlow is a modern, responsive learning platform designed for seamless course, worksheet, and spaced repetition management. The codebase features a TypeScript & Express backend alongside a Vue 3 & Vite frontend, designed to be highly self-hostable.

---

## 🛠️ Deployment Options

LearnFlow can be deployed automatically via Proxmox VE LXC containers, manually on a Linux Server (Debian/Ubuntu), or integrated directly into MDM/Teams clients.

---

### Option 1: Proxmox VE LXC Deployment (Automated)

You can deploy LearnFlow directly into a new Debian 12 LXC container on a Proxmox VE host using the following host shell one-liner:

#### Default Installation (Container ID: 200, Hostname: `learnflow`, Password: `changeme`)
```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash
```

#### Custom Installation (Specify ID, Hostname, and Password)
```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash -s -- 200 learnflow yourpassword
```

The script will automatically:
1. Create and start a Debian 12 LXC container with recommended resources (2 Cores, 2GB RAM, Nesting enabled).
2. Install standard system dependencies (`git`, `curl`, `nginx`, `nodejs 22`).
3. Clone this repository to `/var/www/learnflow`.
4. Run the internal setup script to compile the backend, build the frontend, and configure PM2 and Nginx.

---

### Option 2: Manual Linux Server Deployment (Step-by-Step)

Follow these steps to deploy LearnFlow on any Ubuntu, Debian, or other Linux VPS/server.

#### Step 1: Install System Prerequisites
Install Node.js (v22 is recommended), Git, Nginx, and PM2 (Process Manager).
```bash
# Install Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Install PM2 globally
sudo npm install -g pm2
```

#### Step 2: Clone the Repository
Clone the codebase to your web serving directory:
```bash
sudo git clone https://github.com/damessner/learnflow.git /var/www/learnflow
sudo chown -R $USER:$USER /var/www/learnflow
cd /var/www/learnflow
```

#### Step 3: Configure Environment Variables
Create the environment file for the backend:
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and configure key variables:
- `PORT`: Server port (defaults to `3001`).
- `NODE_ENV`: Set to `production`.
- `JWT_SECRET`: Change to a secure, random string.
- `DB_DIALECT`: Set to `better-sqlite3` (SQLite) or `pg` (PostgreSQL).
- `DB_PATH`: Path for SQLite database (defaults to `./data/learnflow.db`). Make sure you create the `backend/data` directory (`mkdir data`).

#### Step 4: Build and Start the Backend
Install dependencies and build the TypeScript backend. Database migrations are run automatically on server boot!
```bash
npm install --no-package-lock
npm run build

# Start backend using PM2 configuration
pm2 start ../deployment/ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 5: Build the Frontend
Install dependencies and build the Vue 3 production client:
```bash
cd ../frontend
npm install --no-package-lock
npm run build
```
This generates the minified static build files under `/var/www/learnflow/frontend/dist`.

#### Step 6: Configure Nginx HTTP Server
Copy and apply the provided Nginx configuration:
```bash
sudo cp ../deployment/nginx.conf /etc/nginx/sites-available/learnflow
sudo ln -sf /etc/nginx/sites-available/learnflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verify Nginx configuration and reload service
sudo nginx -t
sudo systemctl reload nginx
```
LearnFlow is now accessible at `http://your-server-ip/` (port 80).

---

## 📱 Progressive Web App (PWA) Setup

LearnFlow has full Progressive Web App configurations built-in, enabling a native app-like experience on smartphones, tablets, and desktops without compiler-level native containers.

### Installation on Devices:
- **iOS (Safari)**: Open the LearnFlow URL, tap the **Share** button, and select **Add to Home Screen**.
- **Android (Chrome / Edge)**: Open the LearnFlow URL, tap the **three dots menu**, and tap **Install app** or **Add to Home Screen**.

### School-Wide Mobile Device Management (MDM):
For school-managed iPads/iPhones, administrators can deploy LearnFlow directly using **Microsoft Intune Web Clips**:
1. Log in to the **[Microsoft Intune Admin Center](https://endpoint.microsoft.com/)**.
2. Navigate to **Apps** -> **All apps** -> **Add**.
3. Select **iOS/iPadOS web clip** as the app type.
4. Enter the URL of your hosted LearnFlow instance (e.g. `https://learnflow.my-school.edu/`).
5. Upload the app icon (located in `frontend/public/icon-512.png` or your custom branding logo).
6. Assign the app to student/teacher groups. It will automatically install on their home screens.

---

## 💬 Microsoft Teams Personal App Integration

LearnFlow can be compiled and sideloaded as a dedicated personal tab application inside Microsoft Teams, wrapping your custom self-hosted domain or IP.

1. Go to the `teams-app` directory:
   ```bash
   cd /var/www/learnflow/teams-app
   ```
2. Run the packager script with your self-hosted instance's URL:
   ```bash
   node package-teams.js http://172.16.1.61
   ```
3. A package file named **`learnflow-teams-app.zip`** will be generated.
4. **Deploy in Teams**: Go to Teams client -> **Apps** -> **Manage your apps** -> **Upload a custom app** and upload the ZIP package.
5. Refer to the [Teams App README](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/teams-app/README.md) for more customization details and org-wide pinned deployment policies.

---

## 📂 Project Structure

- **[backend](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/backend)**: Express application with Knex database migrations, TypeScript configurations, Zod validation, and SQLite/PostgreSQL connectors.
- **[frontend](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/frontend)**: Vue 3 single page application built on Vite, configured with Pinia and Vue Router. Contains PWA manifest configurations.
- **[teams-app](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/teams-app)**: Microsoft Teams integration template, script utility, and documentation.
- **[deployment](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/deployment)**: Shell scripts for LXC creation, guest setup, PM2 process management config, and Nginx HTTP server configuration.
