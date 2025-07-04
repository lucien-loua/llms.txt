import { Generator } from "@/components/generator"
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-3 sm:p-5">
      <section className="space-y-2 w-full">
        <header className="text-center ">
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight">
            llms.txt generator
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-lg mx-auto">
            Generate consolidated text files from websites
            for LLM training and inference
          </p>
        </header>
        <Generator />
      </section>
    </main>
  )
}
