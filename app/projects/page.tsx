import { Metadata } from "next";
import ProjectsContent from "../../components/ProjectsContent";

export const metadata: Metadata = {
  title: "Work | Jayden Yu",
  description: "SGLang contributions, GPU kernel work, and personal projects by Jayden Yu.",
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
