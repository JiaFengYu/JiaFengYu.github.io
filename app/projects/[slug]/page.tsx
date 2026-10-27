import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../../lib/projects";
import ProjectDetails from "../../../components/ProjectDetails";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find(p => p.slug === params.slug);
  if (!project) notFound();
  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/projects" className="text-indigo-200 hover:underline">← All work</Link>
      <header className="my-10 border-b border-indigo-300/20 pb-8">
        <p className="eyebrow mb-4">{project.category}</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-5">{project.title}</h1>
        <p className="text-xl leading-relaxed mb-6">{project.summary}</p>
        <div className="flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="topic-tag">{tag}</span>)}</div>
      </header>
      <ProjectDetails project={project} />
    </article>
  );
}
