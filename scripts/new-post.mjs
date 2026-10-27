import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const title = process.argv.slice(2).join(" ").trim();
if (!title) throw new Error('Usage: npm run post -- "Your article title"');
const slug = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
if (!slug) throw new Error("Use a title containing letters or numbers.");
const directory = fileURLToPath(new URL("../content/posts/", import.meta.url));
const manifestPath = path.join(directory, "index.json");
const posts = JSON.parse(await readFile(manifestPath, "utf8"));
if (posts.some(post => post.slug === slug)) throw new Error(`An article named ${slug} already exists.`);
await writeFile(path.join(directory, `${slug}.md`), "## The problem\n\nStart here.\n\n## What I learned\n\nExplain the idea with a concrete example.\n\n## References\n\nLink to the relevant PR, code, or documentation.\n", { flag: "wx" });
posts.unshift({ slug, title, description: "Add a short summary of the article.", tags: ["SGLang"], status: "draft", date: null });
await writeFile(manifestPath, JSON.stringify(posts, null, 2) + "\n");
console.log(`Created content/posts/${slug}.md\nPreview at /blog/${slug}/ with npm run dev.\nSet status to published and add a YYYY-MM-DD date in content/posts/index.json when ready.`);
