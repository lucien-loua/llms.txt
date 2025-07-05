import { Download, Eye, File, FileText } from "lucide-react";
import { useGenerator } from "@/components/generator/context";
import { Button } from "@/components/ui/button";
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/code-block";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { downloadFile, getFileSize, getTruncatedCode } from "@/lib/utils";

export function Results() {
  const { progress, downloadAllFiles } = useGenerator();

  if (!progress.files) return null;
  return (
    <div className="bg-card border rounded-md p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Generated Files</h3>
        <Button onClick={downloadAllFiles} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>
      <div className="grid gap-3">
        {progress.files.llmsTxt && (
          <div className="flex items-center justify-between p-3 bg-background rounded-md border">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">llms.txt</div>
                <div className="text-xs text-muted-foreground">
                  Index file • {getFileSize(progress.files.llmsTxt)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>llms.txt Preview</DialogTitle>
                    <DialogDescription>
                      Preview of your generated llms.txt file (
                      {getFileSize(progress.files.llmsTxt)})
                    </DialogDescription>
                  </DialogHeader>
                  <CodeBlock
                    data={[
                      {
                        language: "markdown",
                        filename: "llms.txt",
                        code: progress.files.llmsTxt,
                      },
                    ]}
                    defaultValue="markdown"
                    className="h-full max-h-[60vh] flex-1 overflow-auto"
                  >
                    <CodeBlockHeader className="p-3 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        llms.txt • {getFileSize(progress.files.llmsTxt)}
                      </span>
                      <CodeBlockCopyButton />
                    </CodeBlockHeader>
                    <CodeBlockBody className="max-h-[50vh] overflow-auto">
                      {(item) => (
                        <CodeBlockItem key={item.code} value="markdown">
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  progress.files &&
                  typeof progress.files.llmsTxt === "string" &&
                  downloadFile(progress.files.llmsTxt, "llms.txt")
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {progress.files.llmsFullTxt && (
          <div className="flex items-center justify-between p-3 bg-background rounded-md border">
            <div className="flex items-center space-x-3">
              <File className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">llms-full.txt</div>
                <div className="text-xs text-muted-foreground">
                  Full content • {getFileSize(progress.files.llmsFullTxt)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>llms-full.txt Preview</DialogTitle>
                    <DialogDescription>
                      Preview of your generated llms-full.txt file (
                      {getFileSize(progress.files.llmsFullTxt)})
                    </DialogDescription>
                  </DialogHeader>
                  <CodeBlock
                    data={[
                      {
                        language: "markdown",
                        filename: "llms-full.txt",
                        code:
                          progress.files.llmsFullTxt.length > 10000
                            ? `${progress.files.llmsFullTxt.slice(0, 10000)}\n\n... (truncated for preview)`
                            : progress.files.llmsFullTxt,
                      },
                    ]}
                    defaultValue="markdown"
                  >
                    <CodeBlockHeader className="p-3 flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        llms-full.txt •{" "}
                        {getFileSize(progress.files.llmsFullTxt)}
                      </span>

                      <CodeBlockCopyButton />
                    </CodeBlockHeader>
                    <CodeBlockBody className="max-h-[50vh] overflow-auto">
                      {(item) => (
                        <CodeBlockItem key={item.code} value="markdown">
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {getTruncatedCode(item.code)}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  progress.files &&
                  typeof progress.files.llmsFullTxt === "string" &&
                  downloadFile(progress.files.llmsFullTxt, "llms-full.txt")
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
