
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import Image from "next/image";
import { set } from "zod";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileReference, setFileReference] = useState<
    { fileName: string; sourceCode: string; summary: string }[] | null
  >(null);
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!project?.id) {
      return;
    }
    e.preventDefault();
    setLoading(true);
    setOpen(true);
    const { output, fileReference: fileReferenceData } = await askQuestion(question, project.id);

    const fileReference = fileReferenceData.map(file => ({
      fileName: file.fileName,
      sourceCode: file.sourceCode,
      summary: file.summary,
      
    }));
    setFileReference(fileReference);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.png" alt="logo" width={40} height={40} />
            </DialogTitle>
            <DialogDescription>
              Your question has been submitted!
            </DialogDescription>
          </DialogHeader>
          
          {answer}
          <h1>file reference</h1>
          {fileReference?.map((file) => {
            return <span>{file.fileName}</span>;
          })}
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit">Ask Dionysus!</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
