import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card rounded-xl p-6 md:p-8 flex flex-col">
      <p className="eyebrow mb-4">{project.category}</p>
      <h3 className="text-2xl font-bold mb-3"><Link href={`/projects/${project.slug}`} className="hover:text-indigo-200">{project.title}</Link></h3>
      <p className="text-gray-200 leading-relaxed mb-6 flex-1">{project.summary}</p>
      <div className="flex flex-wrap gap-2 mb-6">{project.tags.map(tag => <span key={tag} className="topic-tag">{tag}</span>)}</div>
      {project.pullRequest && <a href={project.pullRequest.url} className="text-emerald-200 text-sm mb-4 hover:underline">Merged · PR #{project.pullRequest.number} ↗</a>}
      <Link href={`/projects/${project.slug}`} className="text-indigo-200 inline-flex gap-2 items-center hover:underline">Explore the work <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </article>
  );
}
