"use client";

import { useGenerator } from "./context";
import { GeneratorProvider } from "./context/provider";
import { InputBar } from "./elements/input-bar";
import { Loading } from "./elements/loading";
import { Results } from "./elements/results";

function ApiKeyPrompt() {
  const { hasApiKeys } = useGenerator();
  if (hasApiKeys) return null;
  return (
    <div className="text-center">
      <p className="text-destructive text-sm">
        Configure your Firecrawl API keys in Settings for full generation
      </p>
    </div>
  );
}

export function Generator() {
  return (
    <GeneratorProvider>
      <div className="flex flex-col w-full space-y-3">
        <div className="max-w-lg w-full mx-auto space-y-3 sm:space-y-5">
          <InputBar />
          <Results />
          <Loading />
        </div>
        <ApiKeyPrompt />
      </div>
    </GeneratorProvider>
  );
}
