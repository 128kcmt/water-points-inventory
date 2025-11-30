# Deployment & Git Instructions

## Git Commit Messages
Here are 12 realistic commit messages you can use:

1.  `feat: init new vanilla JS frontend structure`
2.  `feat: add responsive dark mode layout with Malawi theme`
3.  `feat: integrate Leaflet map with dark matter tiles`
4.  `feat: implement API service for backend communication`
5.  `feat: add marker clustering for water points`
6.  `feat: implement sidebar with nearest points logic`
7.  `feat: add search functionality with Nominatim integration`
8.  `feat: implement population buffer visualization`
9.  `feat: add real-time stats dashboard and filters`
10. `fix: optimize mobile view for sidebar and controls`
11. `style: polish animations and hover effects`
12. `docs: add deployment instructions for GitHub Pages`

## Deployment Instructions

### 1. GitHub Pages (Frontend)
Since this is a static site (HTML/CSS/JS), it's perfect for GitHub Pages.

1.  Push your code to GitHub.
2.  Go to your repository **Settings** > **Pages**.
3.  Under **Build and deployment**, select **Source** as `Deploy from a branch`.
4.  Select your branch (e.g., `main`) and set the folder to `/client` (this is crucial!).
    *   *Note: If GitHub Pages doesn't support deploying from a subfolder other than `/docs`, you might need to use a GitHub Action or move the contents of `/client` to `/docs`.*
    *   **Better Option (GitHub Actions):** Create a workflow file `.github/workflows/static.yml` that specifically deploys the `client` directory.

**Important:**
For the frontend to talk to the backend on `localhost` (during dev) or a live server (prod), you need to update `API_BASE` in `client/js/api.js`.
*   **Local:** `const API_BASE = 'http://localhost:3000/api';`
*   **Production:** Change this to your Render backend URL, e.g., `const API_BASE = 'https://your-nest-app.onrender.com/api';`

### 2. Render.com (Backend)
Your NestJS backend is already set up for Render.

1.  Ensure your `render.yaml` or dashboard settings point to the root directory.
2.  Build command: `npm install && npm run build`
3.  Start command: `npm run start:prod`
4.  **CORS:** Make sure your NestJS backend enables CORS for your GitHub Pages URL.
    *   In `src/main.ts`:
        ```typescript
        app.enableCors({
          origin: ['http://localhost:5500', 'https://your-username.github.io'],
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        });
        ```

### 3. Running Locally
To run this new frontend locally:
1.  Install a simple static server: `npm install -g serve`
2.  Run inside `/client`: `serve .`
3.  Open `http://localhost:3000` (or whatever port `serve` gives you)
4.  Ensure your NestJS backend is running on port 3000.
