# LearnFlow

LearnFlow is a modern, responsive learning platform designed for seamless course and worksheet management. The codebase features a TypeScript & Express backend alongside a Vue 3 & Vite frontend.

---

## Proxmox VE LXC Deployment

You can deploy LearnFlow directly into a new Debian 12 LXC container on a Proxmox VE host using the following host shell one-liner:

### Default Installation (Container ID: 200, Hostname: learnflow, Password: changeme)

```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash
```

### Custom Installation (Specify ID, Hostname, and Password)

```bash
curl -fsSL https://raw.githubusercontent.com/damessner/learnflow/main/deployment/create-lxc.sh | bash -s -- 200 learnflow yourpassword
```

The script will automatically:

1. Create and start a Debian 12 LXC container with recommended resources (2 Cores, 2GB RAM, Nesting enabled).
2. Install standard system dependencies (`git`, `curl`).
3. Clone this repository to `/var/www/learnflow`.
4. Run the internal setup script to set up Node.js, install packages, compile the backend, build the frontend, and configure PM2 and Nginx.

---

## Project Structure

- **[backend](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/backend)**: Express application with Knex database migrations, Zod schema validation, TypeScript compilations, and Vitest testing framework.
- **[frontend](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/frontend)**: Vue 3 single page application built on Vite, configured with Pinia store and Vue Router.
- **[deployment](file:///c:/Users/dames/OneDrive%20-%20Mittelschule%20Telfs/github/learnflow/deployment)**: LXC host creation and guest container setup configuration files, Nginx site configuration, and PM2 ecosystem descriptor.
