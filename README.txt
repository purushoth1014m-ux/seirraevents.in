SIERRA EVENTS - WEBSITE + BACKEND ADMIN LOGIN (merged package)

Admin login:  https://YOUR-SITE.netlify.app/admin   (or /admin.html)
Password:     Sierra@Admin#2026   (works right after deploy; change later via Netlify env variable ADMIN_PASSWORD)

HOW TO MERGE WITH YOUR LIVE SITE
This folder already contains the full website + backend. Just redeploy it over your existing site:
 Netlify > your project > Deploys > drag THIS UNZIPPED FOLDER (index.html, admin.html, netlify.toml, netlify/, node_modules/ must be directly inside).
If /api/enquiry or the admin page shows an error after a drag-drop deploy, deploy from GitHub instead
(upload folder to a GitHub repo > Netlify "Import from Git") - Netlify then installs the backend itself.

WHAT THE BACKEND DOES
- Quote form saves each enquiry (ID SE-Q-2026-0001...) and also goes to Netlify Forms (for email alerts: Site configuration > Forms > Form notifications).
- Admin page: login, list of enquiries, status (New/Contacted/Quoted/Won/Lost), owner, filter, CSV download.

CHECK: open /status - it says 'Backend is running' when the functions are live.
