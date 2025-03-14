"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

type Props = {
  fileReferences:
    | { fileName: string; sourceCode: string; summary: string }[]
    | null;
};

const CodeReferences = ({ fileReferences }: Props) => {
  const [tab, setTab] = React.useState(fileReferences?.[0]?.fileName || "");

  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        {/* Tab Buttons */}
        <div className="flex gap-2 overflow-auto rounded-md bg-gray-200 p-1">
          {fileReferences?.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              value={file.fileName}
            >
              <button
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                  {
                    "bg-primary text-primary-foreground": tab === file.fileName,
                  },
                )}
              >
                {file.fileName}
              </button>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {fileReferences?.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] max-w-7xl overflow-auto rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={lucario}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
