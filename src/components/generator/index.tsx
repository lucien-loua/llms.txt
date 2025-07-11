"use client";

import { GeneratorProvider } from "./context/provider";
import { InputBar } from "./elements/input-bar";
import { Loading } from "./elements/loading";
import { Results } from "./elements/results";

export function Generator() {
  return (
    <GeneratorProvider>
      <div className="flex flex-col w-full space-y-3">
        <div className="max-w-lg w-full mx-auto space-y-3 sm:space-y-5">
          <InputBar />
          <Results />
          <Loading />
        </div>
      </div>
    </GeneratorProvider>
  );
}
