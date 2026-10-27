import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Cpu } from "lucide-react";
import { ProjectCard } from "../components";
import { projects } from "../lib/projects";
import { assetPath, site } from "../lib/site";
import { getPosts } from "../lib/posts";
import PostCard from "../components/PostCard";

export default function HomePage() {
  const posts = getPosts().slice(0, 2);
  return (
    <div className="max-w-6xl mx-auto space-y-20">
      <section className="grid md:grid-cols-[1fr_240px] gap-12 items-center py-6 md:py-12">
        <div>
          <p className="eyebrow mb-5">Software engineer · SGLang contributor</p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">Hi, I’m Jayden.<br /><span className="text-indigo-200">I work on efficient inference.</span></h1>
          <p className="text-lg md:text-xl leading-relaxed text-gray-200 max-w-2xl">I’m interested in what happens between a model and the hardware running it: GPU kernels, quantization, memory movement, and the details that make inference faster.</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/projects" className="action-primary">Explore my work <ArrowUpRight size={17} aria-hidden="true" /></Link>
            <Link href="/blog" className="action-secondary">Technical writing <BookOpen size={17} aria-hidden="true" /></Link>
          </div>
          <p className="mt-6 text-sm text-indigo-200">Waterloo CS & mathematics · Runner · Curious about how things work</p>
        </div>
        <div className="relative w-48 h-48 md:w-60 md:h-60 mx-auto rounded-full overflow-hidden border-2 border-indigo-300/60 glow-effect order-first md:order-last">
          <Image src={assetPath("/images/headshot.jpg")} alt="Jayden Yu" fill priority sizes="(max-width: 768px) 192px, 240px" className="object-cover" />
        </div>
      </section>
      <section aria-labelledby="current-work" className="surface p-6 md:p-10">
        <div className="flex items-center gap-3 mb-5"><Cpu className="text-indigo-300" aria-hidden="true" /><p className="eyebrow">Current focus</p></div>
        <h2 id="current-work" className="text-3xl font-bold mb-4">Making the inference path more efficient.</h2>
        <p className="max-w-3xl text-gray-200 leading-relaxed">My merged contributions fuse FP8 KV-cache quantization with cache writes, and dense SwiGLU activation with block-FP8 quantization. I care about the whole path: numerical behavior, dispatch, fallbacks, and performance in context.</p>
        <div className="flex flex-wrap gap-2 my-6">{["SGLang", "GPU kernels", "FP8", "LLM inference"].map(tag => <span key={tag} className="topic-tag">{tag}</span>)}</div>
        <a href={site.contributions} className="inline-flex gap-2 items-center text-indigo-200 font-medium hover:underline">Follow my SGLang contributions <ArrowUpRight size={17} aria-hidden="true" /></a>
      </section>
      <section aria-labelledby="selected-work">
        <div className="section-heading"><div><p className="eyebrow mb-2">Building & learning</p><h2 id="selected-work" className="text-3xl font-bold">Selected work</h2></div><Link href="/projects" className="text-indigo-200 hover:underline">All projects →</Link></div>
        <div className="grid md:grid-cols-2 gap-6">{projects.filter(p => p.featured).map(project => <ProjectCard key={project.slug} project={project} />)}</div>
      </section>
      <section aria-labelledby="writing">
        <div className="section-heading"><div><p className="eyebrow mb-2">Notes from the work</p><h2 id="writing" className="text-3xl font-bold">Technical writing</h2></div><Link href="/blog" className="text-indigo-200 hover:underline">All writing →</Link></div>
        <p className="text-gray-200 mb-6 max-w-2xl leading-relaxed">Things I’m learning while contributing to SGLang, from the mechanics of FP8 to evaluating a kernel optimization.</p>
        {posts.length ? <div className="grid md:grid-cols-2 gap-6">{posts.map(post => <PostCard key={post.slug} post={post} />)}</div> : <div className="surface p-8"><BookOpen className="text-indigo-300 mb-4" aria-hidden="true" /><h3 className="text-xl font-semibold mb-2">First articles in progress</h3><p>Upcoming topics include FP8 KV-cache writes, kernel fusion, and benchmarking inference performance.</p></div>}
      </section>
      <section className="border-t border-indigo-300/20 pt-8 flex flex-col sm:flex-row gap-4 justify-between">
        <p className="max-w-xl">Away from the GPU: distance running, pure mathematics, and the search for Mersenne primes.</p>
        <Link href="/about" className="text-indigo-200 shrink-0 hover:underline">A little more about me →</Link>
      </section>
    </div>
  );
}
