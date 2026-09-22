# Hostinger Deployment Guide for Next.js Frontend (Addior Mechanics)

This guide explains how to deploy the frontend to **Hostinger** using the generated `.htaccess` configuration.

---

## 1. Where is the `.htaccess` File?

The `.htaccess` file has been placed in two locations for your convenience:
- [public/.htaccess](file:///Users/a/Desktop/car-service-platform/Car_Service_Customer/public/.htaccess) — Automatically bundled with static assets when deploying or exporting.
- [.htaccess](file:///Users/a/Desktop/car-service-platform/Car_Service_Customer/.htaccess) — Ready in the project root to copy directly into Hostinger's `public_html`.

---

## 2. What the `.htaccess` File Handles

1. **HTTPS Enforcement**: Automatically redirects all HTTP traffic to HTTPS (301 Permanent Redirect).
2. **URL Rewriting & Clean URLs**: Resolves clean routes (e.g., `/admin/reports`, `/admin/bookings`, `/marketplace`) and falls back to `index.html` or `.html` pages.
3. **Security Headers**:
   - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
   - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - Blocks direct public access to `.env`, `.git`, `package.json`, and configuration files.
4. **Performance & Compression**:
   - Gzip / Brotli compression (`mod_deflate`) for JS, CSS, HTML, SVG, and JSON.
   - 1-year immutable browser caching for hashed Next.js assets (`/_next/static/*`).
   - `no-cache` for HTML documents so updates deploy instantaneously without browser caching issues.

---

## 3. Hostinger Deployment Options

### Option A: Hostinger Node.js Application Manager (Recommended for full SSR / API)

If your Hostinger plan supports Node.js (Hostinger Cloud Hosting, Business Web Hosting with Node.js selector, or VPS):

1. **Upload Files**: Upload your project to Hostinger (excluding `node_modules`).
2. **Hostinger hPanel**:
   - Go to **Advanced** → **Node.js**.
   - Create a Node.js Application:
     - **Node.js version**: 20.x or 22.x
     - **Application root**: directory of your frontend (e.g. `public_html` or subfolder)
     - **Application startup file**: `node_modules/next/dist/bin/next` or custom server script (`npm start`)
   - Run `npm install` and `npm run build` in the hPanel terminal or via SSH.
3. **Enable Reverse Proxy in `.htaccess`**:
   In your `.htaccess` file, uncomment section `C1`:
   ```apache
   RewriteCond %{REQUEST_URI} !^/\.well-known
   RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
   ProxyPassReverse / http://127.0.0.1:3000/
   ```
   *(Change `3000` if Hostinger assigns a different port via `process.env.PORT`)*.

---

### Option B: Hostinger Shared Web Hosting (Static Export / Client-Side App)

If you are uploading to standard Apache web hosting (`public_html`):

1. **Build the Project**:
   ```bash
   cd Car_Service_Customer
   npm run build
   ```
2. **Upload to Hostinger**:
   - Copy the built assets along with `.htaccess` directly into your domain's `public_html/` folder via **Hostinger File Manager** or **FTP**.
3. **Ensure `.htaccess` is Active**:
   - Make sure hidden files are visible in Hostinger File Manager (**Settings** → **Show Hidden Files**).
   - Ensure `.htaccess` is located directly in `public_html/.htaccess`.
   - The pre-configured rewrite rules (section `C2`) will handle all routing, clean URLs, and SPA fallbacks automatically.

---

## 4. Environment Variables on Hostinger

Set your backend API URL in your Hostinger `.env.production` or `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```
*(Or your live backend server IP/domain).*
