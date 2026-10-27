import { BookOpen } from "lucide-react";
import PostCard from "../../components/PostCard";
import { getPosts } from "../../lib/posts";
import { site } from "../../lib/site";

export const metadata = {
  title: "Technical Writing | Jayden Yu",
  description: "Notes and lessons from contributing to SGLang: GPU kernels, FP8, and efficient LLM inference.",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <section className="max-w-6xl mx-auto">
      <header className="max-w-3xl mb-12"><p className="eyebrow mb-3">Learning in the open</p><h1 className="text-4xl md:text-5xl font-bold mb-5">Technical writing</h1><p className="text-xl leading-relaxed">Notes from contributing to SGLang and learning how inference systems work. A place for the details behind a change: the wrong turns, the measurements, and what finally made sense.</p></header>
      {posts.some(post => post.status === "draft") && <aside className="draft-notice mb-8">You’re viewing local drafts. These outlines are excluded from the published site until marked as published.</aside>}
      {posts.length ? <div className="grid md:grid-cols-2 gap-6">{posts.map(post => <PostCard key={post.slug} post={post} />)}</div> : <div className="surface p-8 md:p-12 max-w-3xl"><BookOpen size={32} className="text-indigo-300 mb-5" aria-hidden="true" /><h2 className="text-2xl font-semibold mb-4">First articles in progress</h2><p className="leading-relaxed mb-6">I’m turning my SGLang contribution notes into articles. I’ll start with FP8 KV-cache writes and dense SwiGLU fusion: what I changed, how I checked it, and what I learned along the way.</p><a href={site.contributions} className="text-indigo-200 hover:underline">Explore the contributions on GitHub ↗</a></div>}
    </section>
  );
}
