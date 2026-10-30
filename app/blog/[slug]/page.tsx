import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatPostDate } from "../../../lib/posts";
import { absoluteUrl } from "../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getPosts();
  // Next 14 requires a candidate even before the first article is published.
  // This unregistered slug resolves to notFound; postbuild omits its artifact.
  return posts.length ? posts.map(({ slug }) => ({ slug })) : [{ slug: "_empty" }];
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  return {
    title: `${post.title} | Jayden Yu`,
    description: post.description,
    alternates: { canonical: absoluteUrl(`/blog/${post.slug}/`) },
    robots: post.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date || undefined, authors: ["Jayden Yu"] },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/blog" className="text-indigo-200 hover:underline">← All writing</Link>
      <header className="my-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-200 mb-5">{post.status === "draft" ? <span className="draft-label">Draft outline · local preview</span> : <><time dateTime={post.date!}>{formatPostDate(post.date!)}</time><span>· {post.readingMinutes} min read</span></>}</div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{post.titleLink ? <><a href={post.titleLink.href} className="underline decoration-indigo-300/40 underline-offset-8 hover:decoration-indigo-200">{post.titleLink.label}</a>{post.title.slice(post.titleLink.label.length)}</> : post.title}</h1>
        <p className="text-xl leading-relaxed mb-6">{post.description}</p>
        <div className="flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="topic-tag">{tag}</span>)}</div>
      </header>
      {post.status === "draft" && <aside className="draft-notice mb-8">Unpublished outline. This page is available in the local preview only.</aside>}
      {post.headings.length > 0 && <aside aria-label="In this article" className="surface p-6 mb-10"><h2 className="font-semibold mb-3">In this article</h2><ul className="space-y-2">{post.headings.map(heading => <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}><a href={`#${heading.id}`} className="text-indigo-200 hover:underline">{heading.title}</a></li>)}</ul></aside>}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="border-t border-indigo-300/20 mt-12 pt-8"><Link href="/blog" className="text-indigo-200 hover:underline">← Back to writing</Link></div>
    </article>
  );
}
