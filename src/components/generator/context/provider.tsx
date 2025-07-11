import {
  Activity,
  AlertCircle,
  CheckCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { downloadFile, getFileSize, normalizeUrl } from "@/lib/utils";
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
    maxUrls: 10,
    bringYourOwnKey: undefined,
  });

  const [progress, setProgress] = useState<GenerationProgress>({
    status: "idle",
    totalUrls: 0,
    processedUrls: 0,
    errors: [],
  });

  useEffect(() => {
    const savedKey = localStorage.getItem("firecrawl-api-key");
    if (savedKey) {
      setConfig((prev) => ({
        ...prev,
        bringYourOwnKey: savedKey,
      }));
    }
  }, []);

  const hasOwnKey = Boolean(config.bringYourOwnKey);
  const canGenerate = !!url && !isGenerating;

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
      const normalizedUrl = normalizeUrl(url);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          url: normalizedUrl,
        }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setProgress((prev) => ({ ...prev, ...data }));
              if (data.status === "completed") {
                setIsGenerating(false);
                setProgress((prev) => ({
                  ...prev,
                  ...data,
                  currentUrl: undefined,
                }));
                toast.success("Generation complete", {
                  description: "Your llms.txt files have been successfully generated!",
                });
              }
              if (data.status === "error") {
                setIsGenerating(false);
                toast.error("Generation failed", {
                  description: data.errors?.[0]?.message || "An error occurred",
                });
              }
            } catch {
              // ignore parse error
            }
          }
        }
      }
    } catch (error) {
      setProgress({
        status: "error",
        totalUrls: 0,
        processedUrls: 0,
        errors: [
          {
            message: error instanceof Error ? error.message : "Erreur inconnue",
          },
        ],
      });
      setIsGenerating(false);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleConfigSave = () => {
    if (config.bringYourOwnKey) {
      localStorage.setItem("firecrawl-api-key", config.bringYourOwnKey);
    }
    toast.success("Settings saved", {
      description: "Your API key has been saved locally.",
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
    setConfig({
      url: "",
      maxUrls: 10,
      bringYourOwnKey: undefined,
    });
    toast.success("Key removed", {
      description: "The Firecrawl key has been removed from local storage.",
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
    hasOwnKey,
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
