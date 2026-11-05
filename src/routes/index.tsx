import { createFileRoute } from "@tanstack/react-router";
import { ChromaTheremin } from "@/components/chroma-theremin";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ChromaTheremin />;
}
