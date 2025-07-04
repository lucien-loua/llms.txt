import type React from "react";
import { createContext, useContext } from "react";
import type { GenerationProgress, GeneratorConfig } from "../interfaces";

export interface GeneratorContextType {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  showErrors: boolean;
  setShowErrors: React.Dispatch<React.SetStateAction<boolean>>;
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  progress: GenerationProgress;
  setProgress: React.Dispatch<React.SetStateAction<GenerationProgress>>;
  handleGenerate: () => void;
  handleConfigSave: () => void;
  hasApiKeys: boolean;
  isValidUrl: boolean;
  canGenerate: boolean;
  getStatusIcon: () => React.ReactNode;
  getStatusText: () => string;
  progressPercentage: number;
  downloadAllFiles: () => void;
  resetConfig: () => void;
}

export const GeneratorContext = createContext<GeneratorContextType | null>(null);

export const useGenerator = () => {
  const ctx = useContext(GeneratorContext);
  if (!ctx)
    throw new Error("useGenerator must be used within GeneratorProvider");
  return ctx;
};
