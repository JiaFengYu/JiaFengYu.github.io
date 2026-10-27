import React from 'react';
import { ProjectCard } from "./index";
import { projects } from "../lib/projects";

const ProjectsContent: React.FC = () => {
  return (
    <section className="space-y-8 max-w-6xl mx-auto">
      <header><p className="eyebrow mb-3">Open source & personal projects</p><h1 className="text-4xl font-bold mb-4">Work</h1><p className="text-lg max-w-2xl leading-relaxed">Recent work on SGLang and efficient inference, alongside projects driven by mathematics and curiosity.</p></header>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsContent;
