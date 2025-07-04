import {
  Activity,
  AlertCircle,
  CheckCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { downloadFile, getFileSize } from "@/lib/utils";
import type { GenerationProgress, GeneratorConfig } from "../interfaces";
import { GeneratorContext } from ".";

interface GeneratorProviderProps {
  children: ReactNode;
}

export function GeneratorProvider({ children }: GeneratorProviderProps) {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavedConfigs, setShowSavedConfigs] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [configName, setConfigName] = useState("");

  const [config, setConfig] = useState<GeneratorConfig>({
    url: "",
    maxUrls: 50,
    firecrawlApiKey: "",
    openaiApiKey: "",
  });

  const [progress, setProgress] = useState<GenerationProgress>({
    status: "idle",
    totalUrls: 0,
    processedUrls: 0,
    errors: [],
  });

  useEffect(() => {
    const savedFirecrawlKey = localStorage.getItem("firecrawl-api-key");
    const savedOpenaiKey = localStorage.getItem("openai-api-key");

    if (savedFirecrawlKey || savedOpenaiKey) {
      setConfig((prev) => ({
        ...prev,
        firecrawlApiKey: savedFirecrawlKey || "",
        openaiApiKey: savedOpenaiKey || "",
      }));
    }
  }, []);

  const hasApiKeys = Boolean(config.firecrawlApiKey && config.openaiApiKey);
  let isValidUrl = false;
  try {
    const u = new URL(url);
    isValidUrl = u.protocol === "http:" || u.protocol === "https:";
  } catch {
    isValidUrl = false;
  }
  const canGenerate = isValidUrl && hasApiKeys && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setProgress({
      status: "mapping",
      totalUrls: 0,
      processedUrls: 0,
      errors: [],
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          url,
        }),
      });

      if (!response.ok) throw new Error("Failed to start generation");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setProgress(data);
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }

      toast.success("Generation complete", {
        description: "Your llms.txt files have been generated successfully!",
      });
    } catch (error) {
      setProgress({
        status: "error",
        totalUrls: 0,
        processedUrls: 0,
        errors: [
          {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      });
      toast.error("Generation failed", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigSave = () => {
    if (config.firecrawlApiKey) {
      localStorage.setItem("firecrawl-api-key", config.firecrawlApiKey);
    }
    if (config.openaiApiKey) {
      localStorage.setItem("openai-api-key", config.openaiApiKey);
    }
    toast.success("Settings saved", {
      description: "Your API keys have been saved locally.",
    });
  };

  const downloadAllFiles = () => {
    if (progress.files?.llmsTxt) {
      downloadFile(progress.files.llmsTxt, "llms.txt");
    }
    if (progress.files?.llmsFullTxt) {
      setTimeout(() => {
        if (progress.files?.llmsFullTxt) {
          downloadFile(progress.files.llmsFullTxt, "llms-full.txt");
        }
      }, 100);
    }
    toast.success("All files downloaded", {
      description: "Both llms.txt files have been downloaded.",
    });
  };

  const resetConfig = () => {
    localStorage.removeItem("firecrawl-api-key");
    localStorage.removeItem("openai-api-key");
    setConfig({
      url: "",
      maxUrls: 50,
      firecrawlApiKey: "",
      openaiApiKey: "",
    });
    toast.success("Clés supprimées", {
      description: "Les clés API ont été supprimées du stockage local.",
    });
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case "mapping":
        return <Globe className="h-4 w-4 animate-pulse text-blue-500" />;
      case "scraping":
        return <Activity className="h-4 w-4 animate-pulse text-orange-500" />;
      case "generating":
        return <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case "mapping":
        return "Mapping website structure...";
      case "scraping":
        return "Extracting content from pages...";
      case "generating":
        return "Generating AI summaries...";
      case "completed":
        return "Generation complete!";
      case "error":
        return "Generation failed";
      default:
        return "";
    }
  };

  const progressPercentage =
    progress.totalUrls > 0
      ? Math.round((progress.processedUrls / progress.totalUrls) * 100)
      : 0;

  const value = {
    url,
    setUrl,
    isGenerating,
    setIsGenerating,
    showSavedConfigs,
    setShowSavedConfigs,
    showErrors,
    setShowErrors,
    configName,
    setConfigName,
    config,
    setConfig,
    progress,
    setProgress,
    handleGenerate,
    handleConfigSave,
    hasApiKeys,
    isValidUrl,
    canGenerate,
    getStatusIcon,
    getStatusText,
    progressPercentage,
    getFileSize,
    downloadAllFiles,
    downloadFile,
    resetConfig,
  };
  return (
    <GeneratorContext.Provider value={value}>
      {children}
    </GeneratorContext.Provider>
  );
}
