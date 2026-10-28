import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";
const posts = JSON.parse(readFileSync("content/posts/index.json", "utf8"));
const routes = ["", "about", "projects", "gimps", "blog", "projects/sglang-fp8-kv-cache", "projects/sglang-swiglu-fp8", "projects/mersenne-cluster", "projects/orbit-simulator"];
for (const route of routes) assert.ok(existsSync(path.join(root, route, "index.html")), `Missing route: /${route}`);
assert.ok(existsSync(path.join(root, ".nojekyll")), "Missing .nojekyll");
for (const asset of ['index.html', 'app.js', 'api-client.js', 'config.js', 'styles.css', 'basemap.svg']) {
  assert.ok(existsSync(path.join(root, 'orbit-explorer', asset)), `Missing orbit explorer asset: ${asset}`);
}
assert.ok(!existsSync(path.join(root, "blog/_empty/index.html")), "Empty-blog fallback should not be exported");
for (const post of posts) {
  const file = path.join(root, "blog", post.slug, "index.html");
  if (post.status === "draft") assert.ok(!existsSync(file), `Draft leaked into export: ${post.slug}`);
  else assert.ok(existsSync(file), `Published article missing: ${post.slug}`);
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

const htmlFiles = files(root).filter(file => file.endsWith(".html"));
let links = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  assert.ok(!html.includes("/_next/image?"), `Server-side image optimizer in ${file}`);
  assert.ok(!html.includes("Draft outline · local preview"), `Draft content leaked into ${file}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    let pathname = decodeURIComponent(new URL(value, "https://example.com").pathname);
    if (prefix) {
      assert.ok(pathname === prefix || pathname.startsWith(`${prefix}/`), `Missing base path: ${value} in ${file}`);
      pathname = pathname.slice(prefix.length);
    }
    const target = path.join(root, pathname);
    assert.ok(existsSync(target), `Broken asset/link: ${value} in ${file}`);
    if (statSync(target).isDirectory()) assert.ok(existsSync(path.join(target, "index.html")), `Missing directory index: ${value}`);
    links++;
  }
}
console.log(`Static export verified: ${htmlFiles.length} HTML files, ${links} local links/assets, published posts present, drafts excluded.`);
