import PromptForm from "@/components/form-prompt";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Image
        className="dark:invert absolute top-2 left-2"
        src="https://nextjs.org/icons/next.svg"
        alt="Next.js logo"
        width={100}
        height={24}
        priority
      />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-center">
          AI Question Generator
        </h1>
        <PromptForm />
      </div>
    </div>
  );
}
