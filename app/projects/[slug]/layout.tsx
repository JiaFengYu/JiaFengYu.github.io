import { Metadata } from "next";
import { ReactNode } from "react";
import { projects } from "../../../lib/projects";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = projects.find(p => p.slug === params.slug);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }
  
  return {
    title: `${project.title} | Jayden Yu`,
    description: project.summary,
  };
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return children;
} 
