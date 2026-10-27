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

This creates a Markdown file in `content/posts/` and a draft entry in `content/posts/index.json`. Edit the article and its title, description, and tags. The existing two outlines are starting points for the two SGLang contributions; they are not published articles.

Markdown supports fenced code blocks, tables, images, lists, and links. Use `##` and `###` for sections; the page supplies the title and generates a table of contents. Raw HTML is disabled. Place images in `public/images/blog/` and reference them as `/images/blog/filename.png`.

Drafts appear only in `npm run dev`. To publish an article, set its `status` to `published` and add a `date` in `YYYY-MM-DD` format in the index. Keep the slug stable once published. Run the production checks before pushing:

```bash
npm run build
npm run check:export
```

The `out/` directory is the deployable site. To preview exactly what GitHub Pages will serve, run `npm run preview` and open http://localhost:3002. Draft articles are excluded from the export and sitemap.

## Publish to jiafengyu.github.io

GitHub’s account-level Pages address must be served from the **JiaFengYu/JiaFengYu.github.io** repository. Publishing this repository under its current name, `personal-website`, would use `/personal-website/` instead.

1. Create the public `JiaFengYu.github.io` repository under the `JiaFengYu` account if it does not already exist. If it exists, inspect its current contents before replacing anything.
2. Push this source tree, including `.github/workflows/pages.yml`, to that repository’s default branch. For an existing site, use a fresh clone of that repository and replace its site files while keeping `.git/` so its history is preserved. Do not push this unrelated checkout over the existing repository. For an empty Pages repository, add it as another remote:

   ```bash
   git remote add pages https://github.com/JiaFengYu/JiaFengYu.github.io.git
   git push pages main
   ```

   Commit the website changes first. Do not force-push over an existing site. The commands above assume the empty repository will use `main`.
3. In that repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Deploy GitHub Pages → Run workflow** and select the default branch. Future pushes to the default branch build, check, and deploy automatically. Other branches and pull requests build and check without deploying.
5. Confirm the workflow succeeds, then open https://jiafengyu.github.io/ and test the article/project links directly.

The workflow deploys only from the default branch of `JiaFengYu/JiaFengYu.github.io` to avoid publishing an unintended copy from the original repository. It supports an existing default branch such as `main` or `master`. It uses GitHub’s Pages token and OIDC permissions; no personal access token is needed in the workflow.

## Configuration

- Profile and URLs: `lib/site.ts`, `app/page.tsx`, and `app/about/page.tsx`.
- Contributions and project details: `lib/projects.ts`.
- Articles: `content/posts/index.json` and the matching `.md` files.
- Résumé: replace `public/resume.pdf` when you have an updated version.
- GitHub Pages export: `next.config.js` and `.github/workflows/pages.yml`.

The default URL is the account-level site. `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` can support a project site if needed. For example, build with `NEXT_PUBLIC_BASE_PATH=/personal-website` and `NEXT_PUBLIC_SITE_URL=https://jiafengyu.github.io/personal-website`, and pass the same base path to `npm run check:export`. The supplied deployment workflow deliberately targets the account-level site.

Stop the development server before building in the same checkout: Next.js shares the `.next/` cache between development and production builds. Use a separate checkout if both need to run at once.
