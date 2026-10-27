import type { MetadataRoute } from "next";
import { getPosts } from "../lib/posts";
import { projects } from "../lib/projects";
import { absoluteUrl } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about/", "/projects/", "/blog/", "/gimps/", ...projects.map(p => `/projects/${p.slug}/`), ...getPosts().filter(p => p.status === "published").map(p => `/blog/${p.slug}/`)].map(path => ({ url: absoluteUrl(path) }));
}
