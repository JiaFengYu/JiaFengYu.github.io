import Link from "next/link";
import Image from "next/image";
import { assetPath } from "../lib/site";
import type { Project } from "../lib/projects";

export default function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="space-y-10">
      {project.demo && <a href={assetPath(project.demo.href)} className="inline-flex items-center gap-3 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300">{project.demo.label} <span aria-hidden="true">→</span></a>}
      {project.preview && <figure>
        <a href={assetPath(project.preview.src)} target="_blank" rel="noreferrer">
          <Image src={assetPath(project.preview.src)} alt={project.preview.alt} width={project.preview.width} height={project.preview.height} className="w-full h-auto rounded-2xl border border-indigo-300/20" />
        </a>
        <figcaption className="mt-4 text-sm leading-relaxed text-gray-300">{project.preview.caption}</figcaption>
      </figure>}
      {project.details.map(section => <section key={section.title}><h2 className="text-2xl font-semibold mb-4">{section.title}</h2><p className="text-lg leading-relaxed text-gray-200">{section.text}</p></section>)}
      {project.links.length > 0 && <div className="flex flex-wrap gap-4 border-t border-indigo-300/20 pt-6">{project.links.map(link => link.download ? <a key={link.href} href={assetPath(link.href)} download className="text-indigo-200 hover:underline">{link.label} ↓</a> : link.href.startsWith("/") ? <Link key={link.href} href={link.href} className="text-indigo-200 hover:underline">{link.label} →</Link> : <a key={link.href} href={link.href} className="text-indigo-200 hover:underline">{link.label} ↗</a>)}</div>}
    </div>
  );
}
