# LearnFlow - Microsoft Teams Personal App Integration

This directory contains the manifest template and dynamic packager script to deploy LearnFlow as a Microsoft Teams Personal App. 

By wrapping LearnFlow in a Teams Personal App, students and teachers can access their active recall worksheets, spaced repetition lists, daily mixes, and custom avatar profiles directly inside Microsoft Teams as a dedicated tab.

---

## 🚀 Quick Start (Generating the Package)

The dynamic packager script `package-teams.js` is **zero-dependency** and runs on any system with Node.js installed. It requires no `npm install` step.

1. Open your terminal in this directory (`teams-app`).
2. Run the packager script with your self-hosted URL or local IP:
   ```bash
   node package-teams.js http://172.16.1.61
   ```
   *(Replace `http://172.16.1.61` with your actual self-hosted domain or IP. E.g., `https://learnflow.my-school.edu`)*

3. **Output**: The script will output a file named **`learnflow-teams-app.zip`** in this directory. This ZIP package contains:
   - `manifest.json` (dynamically configured with your domain and URLs)
   - `color.png` (app icon)
   - `outline.png` (monochrome sidebar icon)

---

## 🎨 Customizing the App Icons

Before running the packager (or to update the app), you can replace the placeholder 1x1 transparent icons with your custom school or LearnFlow branding:

| File | Purpose | Recommended Specs |
| :--- | :--- | :--- |
| **`color.png`** | The full-color logo shown in the Teams Apps center and store. | `192x192` pixels, PNG format. |
| **`outline.png`** | The simplified monochrome outline icon shown in the Teams left navigation rail. | `32x32` pixels, PNG format with alpha channel (transparent background). |

*If these files do not exist, the packaging script will automatically generate transparent 1x1 placeholders so the ZIP remains valid and installable.*

---

## 📥 Uploading & Deploying to Microsoft Teams

Once you have generated `learnflow-teams-app.zip`, follow these steps to install it in your Teams client:

### Option A: Personal Sideloading (For Testing)
1. Open **Microsoft Teams** (web or desktop client).
2. Click **Apps** in the bottom-left corner of the sidebar.
3. Click **Manage your apps** (typically at the bottom of the list).
4. Click **Upload an app** -> **Upload a custom app**.
5. Select the generated `learnflow-teams-app.zip` file.
6. Click **Add** to install it. It will now appear on your left sidebar!

> [!NOTE]
> If you do not see the "Upload a custom app" option, custom app uploading might be disabled by your organization's Teams administrator.

### Option B: School/Tenant-Wide Distribution (For Administrators)
If you want to make LearnFlow available to all students and teachers in your school:
1. Log in to the **[Microsoft Teams Admin Center](https://admin.teams.microsoft.com/)**.
2. Navigate to **Teams apps** -> **Manage apps**.
3. Click **Upload new app** and upload the `learnflow-teams-app.zip`.
4. (Optional) Go to **Setup policies** -> **Global (Org-wide default)** under "Pinned apps" to pre-install and pin LearnFlow to the left rail for all students and teachers.

---

## 🔒 Security & Sandboxing

Teams enforces strict sandboxing rules on external tabs. When configuring your host URL:
- Only domains declared in `validDomains` (handled automatically by `package-teams.js`) can load inside the tab.
- If you access LearnFlow via an IP address (e.g. `http://172.16.1.61`), the packager will register the IP as the valid domain.
- For production use, **HTTPS is highly recommended** since modern browsers and Teams clients may block non-secure HTTP framing depending on client security policies.
