import Link from "next/link";
import type { Post } from "../lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="surface p-6 md:p-8 flex flex-col">
      <div className="flex gap-3 items-center mb-4 text-sm text-indigo-200">
        {post.status === "draft" ? <span className="draft-label">Draft outline · local preview</span> : <time dateTime={post.date!}>{post.date}</time>}
        {post.status === "published" && <span>{post.readingMinutes} min read</span>}
      </div>
      <h3 className="text-2xl font-bold mb-3"><Link href={`/blog/${post.slug}`} className="hover:text-indigo-200">{post.title}</Link></h3>
      <p className="text-gray-200 leading-relaxed mb-6 flex-1">{post.description}</p>
      <div className="flex flex-wrap gap-2 mb-6">{post.tags.map(tag => <span className="topic-tag" key={tag}>{tag}</span>)}</div>
      <Link href={`/blog/${post.slug}`} className="text-indigo-200 hover:underline">{post.status === "draft" ? "Preview outline" : "Read article"} →</Link>
    </article>
  );
}
