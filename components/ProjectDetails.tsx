import Link from "next/link";
import Image from "next/image";
import { assetPath } from "../lib/site";
import type { Project } from "../lib/projects";

export default function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="space-y-10">
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
