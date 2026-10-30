import fs from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";
import entries from "../content/posts/index.json";
import { assetPath } from "./site";

export interface Post {
  slug: string;
  title: string;
  titleLink?: { label: string; href: string };
  description: string;
  tags: string[];
  status: "draft" | "published";
  date: string | null;
  readingMinutes: number;
}

const directory = path.join(process.cwd(), "content/posts");

export function getPosts(): Post[] {
  const seen = new Set<string>();
  return entries.map(entry => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || seen.has(entry.slug)) {
      throw new Error(`Invalid or duplicate article slug: ${entry.slug}`);
    }
    seen.add(entry.slug);
    if (entry.status !== "draft" && entry.status !== "published") {
      throw new Error(`Invalid article status: ${entry.slug}`);
    }
    if (entry.titleLink && (!entry.titleLink.label || !entry.title.startsWith(entry.titleLink.label) || !entry.titleLink.href.startsWith("https://"))) {
      throw new Error(`Invalid article title link: ${entry.slug}`);
    }
    if (entry.status === "published" && (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || Number.isNaN(Date.parse(entry.date)))) {
      throw new Error(`Published articles need a YYYY-MM-DD date: ${entry.slug}`);
    }
    return entry;
  }).filter(entry => entry.status === "published" || process.env.NODE_ENV !== "production")
    .map(entry => {
      const source = fs.readFileSync(path.join(directory, `${entry.slug}.md`), "utf8");
      return { ...entry, status: entry.status as Post["status"], readingMinutes: Math.max(1, Math.ceil(source.split(/\s+/).length / 220)) };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getPost(slug: string) {
  // Resolve only registered, visible posts; never use arbitrary route input as a path.
  const post = getPosts().find(entry => entry.slug === slug);
  if (!post) return undefined;
  const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const tokens = markdown.parse(fs.readFileSync(path.join(directory, `${post.slug}.md`), "utf8"), {});
  const headings: { id: string; title: string; level: number }[] = [];
  const ids = new Map<string, number>();
  tokens.forEach((token, index) => {
    if (token.type === "heading_open") {
      const title = tokens[index + 1].content;
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      const count = (ids.get(base) || 0) + 1;
      ids.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      token.attrSet("id", id);
      if (token.tag === "h2" || token.tag === "h3") headings.push({ id, title, level: Number(token.tag.slice(1)) });
    }
    // Markdown links and images also need the GitHub Pages project prefix.
    for (const child of token.children || []) {
      const attr = child.type === "image" ? "src" : "href";
      const value = child.attrGet(attr);
      if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) child.attrSet(attr, assetPath(value));
    }
  });
  return { ...post, headings, html: markdown.renderer.render(tokens, markdown.options, {}) };
}

export function formatPostDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
