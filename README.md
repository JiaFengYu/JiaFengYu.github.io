# Jayden Yu’s website

Personal site for SGLang contributions, technical writing, and projects. Built with Next.js and exported to static HTML for **https://jiafengyu.github.io/**.

## Local preview

Use Node 22 (`nvm use` if you use nvm):

```bash
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000. On a remote devserver, forward port 3000 from a terminal on your laptop:

```bash
ssh -N -L 3001:127.0.0.1:3000 user@your-devserver
```

Then open http://localhost:3001 on your laptop.

## Write an article

```bash
npm run post -- "What I learned about FP8"
```

This creates a Markdown file in `content/posts/` and a draft entry in `content/posts/index.json`. Edit the article and its title, description, and tags. The first article is `content/posts/fp8-kv-cache-lessons.md`; edit that file for future updates. The SwiGLU article remains an unpublished outline.

Markdown supports fenced code blocks, tables, images, lists, and links. Use `##` and `###` for sections; the page supplies the title and generates a table of contents. Raw HTML is disabled. Place images in `public/images/blog/` and reference them as `/images/blog/filename.png`.

An optional `titleLink` object in the index can link the beginning of an article title, for example `{"label": "SGLang PR#1", "href": "https://github.com/sgl-project/sglang/pull/40785"}`. Its label must match the beginning of the plain-text `title`. The first article's memory diagram is a static SVG in `public/images/blog/`; Mermaid code fences are not rendered automatically.

Drafts appear only in `npm run dev`. To publish an article, set its `status` to `published` and add a `date` in `YYYY-MM-DD` format in the index. Keep the slug stable once published. Run the production checks before pushing:

```bash
npm run build
npm run check:export
```

The `out/` directory is the deployable site. To preview exactly what GitHub Pages will serve, run `npm run preview` and open http://localhost:3002. Draft articles are excluded from the export and sitemap.

## Publish to jiafengyu.github.io

The official repository is **JiaFengYu/JiaFengYu.github.io**, and its deployed branch is **`gh-pages`**. On the devserver, use `/data/users/jaydenyu/JiaFengYu.github.io`.

After editing an article and passing the production checks, commit its Markdown, index entry, and any images, then push:

```bash
git add content/posts/fp8-kv-cache-lessons.md content/posts/index.json
git commit -m "Update FP8 KV-cache article"
git push origin gh-pages
```

Stage any changed image files too. If your update is already committed, only the push is needed. Open **Actions → Deploy GitHub Pages** and wait for the workflow to succeed. The first article will be at https://jiafengyu.github.io/blog/fp8-kv-cache-lessons/.

Pages is configured to use **GitHub Actions**. Pushes to the default branch build, check, and deploy automatically; other branches and pull requests build and check without deploying. The workflow uses GitHub's Pages token and OIDC permissions. Blog updates do not require redeploying the separate Render API.

## Configuration

### Interactive satellite explorer

The explorer's browser assets are in `public/orbit-explorer/`. All orbital calculations and GeoJSON generation stay on a separately hosted Rust API. Set the **Actions repository variable** `ORBIT_API_URL` in `JiaFengYu/JiaFengYu.github.io` to the deployed HTTPS backend origin, then rerun the Pages workflow. It passes that URL to `NEXT_PUBLIC_ORBIT_API_URL` during the build. The backend must allow the exact origin `https://jiafengyu.github.io` through `ORBIT_ALLOWED_ORIGINS`.

The project page displays an **Open interactive explorer** button when the variable is set. The hosted page lives at `/orbit-explorer/`; `/orbit-explorer/index.html` also works. Without a configured backend, the button stays hidden and the standalone page shows an unavailable message.

For local development, set `NEXT_PUBLIC_ORBIT_API_URL=http://127.0.0.1:8788`, run `node scripts/configure-orbit.mjs`, and start Next with the same environment variable. Start the Rust server with `--allowed-origin` matching the browser's actual website origin. Forward both website and API ports when using a remote devserver. The same configuration script runs automatically before production builds.

Backend Docker/Render setup, health checks, data freshness, and two-origin browser verification are documented in the `orbit-track` repository's `docs/hosting.md`. The UI copy can be refreshed with that repository's `scripts/export-web.py --output /path/to/website/public/orbit-explorer`. Backend and website deployments remain separate.

### Site content

- Profile and URLs: `lib/site.ts`, `app/page.tsx`, and `app/about/page.tsx`.
- Contributions and project details: `lib/projects.ts`.
- Articles: `content/posts/index.json` and the matching `.md` files.
- Résumé: replace `public/resume.pdf` when you have an updated version.
- GitHub Pages export: `next.config.js` and `.github/workflows/pages.yml`.

The default URL is the account-level site. `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` can support a project site if needed. For example, build with `NEXT_PUBLIC_BASE_PATH=/personal-website` and `NEXT_PUBLIC_SITE_URL=https://jiafengyu.github.io/personal-website`, and pass the same base path to `npm run check:export`. The supplied deployment workflow deliberately targets the account-level site.

Stop the development server before building in the same checkout: Next.js shares the `.next/` cache between development and production builds. Use a separate checkout if both need to run at once.
