import { AlertCircle, ArrowUp, Settings } from "lucide-react";
import { useState } from "react";
import { useGenerator } from "@/components/generator/context";
import { ThemeToggler } from "@/components/theme/toggler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Spinner } from "@/components/ui/spinner";

export function InputBar() {
  const {
    url,
    setUrl,
    isGenerating,
    canGenerate,
    handleGenerate,
    config,
    setConfig,
    isValidUrl,
    handleConfigSave,
    resetConfig,
  } = useGenerator();

  const [open, setOpen] = useState(false);
  const handleSaveAndClose = () => {
    handleConfigSave();
    setOpen(false);
  };

  const handleResetAndClose = () => {
    resetConfig();
    setOpen(false);
  };

  return (
    <>
      {url && !isValidUrl && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive rounded-md px-3 py-2">
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-sm text-destructive">
              Please enter a valid URL starting with http:// or https://
            </span>
          </div>
        </div>
      )}
      <PromptInput
        isLoading={isGenerating}
        value={url}
        onValueChange={setUrl}
        onSubmit={handleGenerate}
      >
        <div className="flex flex-col gap-2">
          <PromptInputTextarea
            placeholder="Enter a URL"
            disabled={isGenerating}
          />

          <PromptInputActions className="flex w-full items-center justify-between">
            <div className="space-x-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <PromptInputAction tooltip="Settings">
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isGenerating}
                    >
                      <Settings size={18} />
                    </Button>
                  </DialogTrigger>
                </PromptInputAction>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Max URLs</Label>
                      <Input
                        type="number"
                        value={config.maxUrls}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            maxUrls: Number.parseInt(e.target.value) || 50,
                          })
                        }
                        min="1"
                        max="1000"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Firecrawl API Key</Label>
                      <Input
                        type="password"
                        placeholder="fc-..."
                        value={config.firecrawlApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            firecrawlApiKey: e.target.value,
                          })
                        }
                        className="font-mono"
                      />
                      <span className="text-xs text-muted-foreground mt-1 ml-1">Obtenez une clé sur <a href='https://www.firecrawl.dev/app/api-keys' target='_blank' rel='noopener noreferrer' className='underline text-primary'>firecrawl.dev</a></span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">OpenAI API Key</Label>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={config.openaiApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openaiApiKey: e.target.value,
                          })
                        }
                        className="font-mono"
                      />
                      <span className="text-xs text-muted-foreground mt-1 ml-1">Générez une clé sur <a href='https://platform.openai.com/api-keys' target='_blank' rel='noopener noreferrer' className='underline text-primary'>openai.com</a></span>
                    </div>
                    {(!!config.firecrawlApiKey || !!config.openaiApiKey) && (
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={handleResetAndClose} className="text-destructive w-full">
                          Reset
                        </Button>
                      </div>
                    )}
                    <Button onClick={handleSaveAndClose} className="w-full">
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <PromptInputAction tooltip="Theme">
                <ThemeToggler />
              </PromptInputAction>
            </div>
            <PromptInputAction tooltip="Generate">
              <Button
                size="icon"
                disabled={!url.trim() || isGenerating || !canGenerate}
                onClick={handleGenerate}
              >
                {!isGenerating ? <ArrowUp size={18} /> : <Spinner />}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </div>
      </PromptInput>
    </>
  );
};
