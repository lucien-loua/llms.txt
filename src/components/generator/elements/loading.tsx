import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useGenerator } from "@/components/generator/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

export function Loading() {
  const {
    isGenerating,
    progress,
    progressPercentage,
    getStatusIcon,
    getStatusText,
    showErrors,
    setShowErrors,
  } = useGenerator();

  if (!(isGenerating || progress.status !== "idle")) return null;
  return (
    <div className="bg-card border rounded-md p-5 space-y-3">
      {progress.status !== "idle" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <span className="text-sm font-medium text-foreground">
              {getStatusText()}
            </span>
          </div>
          {progress.totalUrls > 0 && (
            <Badge variant="secondary" className="font-mono">
              {progress.processedUrls}/{progress.totalUrls}
            </Badge>
          )}
        </div>
      )}
      {progress.totalUrls > 0 && (
        <div className="space-y-3">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercentage}% complete</span>
            <span>
              {progress.processedUrls} of {progress.totalUrls} URLs processed
            </span>
          </div>
        </div>
      )}
      {progress.currentUrl && (
        <div className="text-xs text-muted-foreground font-mono bg-background p-3 rounded border">
          Currently processing: {progress.currentUrl}
        </div>
      )}
      {progress.errors.length > 0 && (
        <Collapsible open={showErrors} onOpenChange={setShowErrors}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive p-0 h-auto"
            >
              <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
              {progress.errors.length} erreur
              {progress.errors.length !== 1 ? "s" : ""} détectée
              {progress.errors.length !== 1 ? "s" : ""}
              {showErrors ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.errors
                .slice(-5)
                .map(
                  (error: { message: string; url?: string }, index: number) => (
                    <div
                      key={index.toString()}
                      className="flex items-start gap-2 bg-destructive/10 border border-destructive rounded-md p-3"
                    >
                      <AlertCircle className="h-4 w-4 mt-0.5 text-destructive" />
                      <div>
                        <div className="font-medium text-destructive text-sm">
                          {error.message}
                        </div>
                        {error.url && (
                          <div className="text-destructive font-mono mt-1 text-xs">
                            {error.url}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
