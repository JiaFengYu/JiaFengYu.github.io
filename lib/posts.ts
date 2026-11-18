import fs from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";
import katex from "katex";
import { imageSize } from "image-size";
import entries from "../content/posts/index.json";
import { assetPath } from "./site";

export interface PostMetadata {
  slug: string;
  title: string;
  titleLink?: { label: string; href: string };
  description: string;
  tags: string[];
  status: "draft" | "published";
  date: string | null;
}

export interface Post extends PostMetadata {
  readingMinutes: number;
}

const directory = path.join(process.cwd(), "content/posts");

function localImageDimensions(src: string) {
  if (!src.startsWith("/") || src.startsWith("//")) return undefined;
  const publicDirectory = path.join(process.cwd(), "public");
  try {
    const filename = path.resolve(publicDirectory, `.${decodeURIComponent(src.split(/[?#]/)[0])}`);
    if (!filename.startsWith(`${publicDirectory}${path.sep}`)) return undefined;
    return imageSize(fs.readFileSync(filename));
  } catch {
    // Dimension hints are optional; the export check catches missing local assets.
    return undefined;
  }
}

// Metadata-only consumers don't need to read or render article bodies.
export function getPostIndex(): PostMetadata[] {
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
    return { ...entry, status: entry.status as PostMetadata["status"] };
  }).filter(entry => entry.status === "published" || process.env.NODE_ENV !== "production")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function estimateReadingMinutes(source: string) {
  return Math.max(1, Math.ceil(source.split(/\s+/).length / 220));
}

export function getPosts(): Post[] {
  return getPostIndex().map(entry => {
    const source = fs.readFileSync(path.join(directory, `${entry.slug}.md`), "utf8");
    return { ...entry, readingMinutes: estimateReadingMinutes(source) };
  });
}

export function getPost(slug: string) {
  // Resolve only registered, visible posts; never use arbitrary route input as a path.
  const metadata = getPostIndex().find(entry => entry.slug === slug);
  if (!metadata) return undefined;
  const source = fs.readFileSync(path.join(directory, `${metadata.slug}.md`), "utf8");
  const post = { ...metadata, readingMinutes: estimateReadingMinutes(source) };
  const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const renderImage = markdown.renderer.rules.image!;
  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const image = renderImage(tokens, index, options, env, renderer);
    // Keep explicitly linked images as links; don't nest a button inside them.
    const linkDepth = tokens.slice(0, index).reduce((depth, token) => depth + (token.type === "link_open" ? 1 : token.type === "link_close" ? -1 : 0), 0);
    if (linkDepth > 0) return image;
    const alt = tokens[index].attrGet("alt");
    const label = markdown.utils.escapeHtml(alt ? `Enlarge image: ${alt}` : "Enlarge image");
    return `<button type="button" class="article-image" aria-label="${label}" aria-haspopup="dialog">${image}</button>`;
  };
  const renderFence = markdown.renderer.rules.fence!;
  markdown.renderer.rules.fence = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    if (token.info.trim() === "math") {
      return katex.renderToString(token.content, { displayMode: true, throwOnError: true, trust: false }) + "\n";
    }
    return renderFence(tokens, index, options, env, renderer);
  };
  const tokens = markdown.parse(source, {});
  // Leading photo paragraphs form an introduction above the table of contents.
  // Leave other articles' prose and inline images in their original body.
  let introEnd = 0;
  while (tokens[introEnd]?.type === "paragraph_open" && tokens[introEnd + 2]?.type === "paragraph_close") {
    const children = tokens[introEnd + 1]?.children || [];
    if (!children.some(token => token.type === "image") || !children.every(token =>
      token.type === "image" || token.type === "softbreak" || token.type === "hardbreak" ||
      (token.type === "text" && !token.content.trim())
    )) break;
    introEnd += 3;
  }
  const headings: { id: string; title: string; level: number }[] = [];
  const ids = new Map<string, number>();
  let imageCount = 0;
  tokens.forEach((token, index) => {
    if (token.type === "heading_open") {
      const title = tokens[index + 1].content;
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      const count = (ids.get(base) || 0) + 1;
      ids.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      token.attrSet("id", id);
      if (["h2", "h3", "h4"].includes(token.tag)) headings.push({ id, title, level: Number(token.tag.slice(1)) });
    }
    // Markdown links and images also need the GitHub Pages project prefix.
    for (const child of token.children || []) {
      const attr = child.type === "image" ? "src" : "href";
      const value = child.attrGet(attr);
      if (child.type === "image") {
        const priority = index < introEnd && imageCount === 0;
        imageCount++;
        child.attrSet("loading", priority ? "eager" : "lazy");
        child.attrSet("decoding", "async");
        if (priority) child.attrSet("fetchpriority", "high");
        const dimensions = typeof value === "string" ? localImageDimensions(value) : undefined;
        if (dimensions) {
          child.attrSet("width", String(dimensions.width));
          child.attrSet("height", String(dimensions.height));
        }
      }
      if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) child.attrSet(attr, assetPath(value));
    }
  });
  return {
    ...post,
    headings,
    introHtml: markdown.renderer.render(tokens.slice(0, introEnd), markdown.options, {}),
    html: markdown.renderer.render(tokens.slice(introEnd), markdown.options, {}),
  };
}

export function formatPostDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
