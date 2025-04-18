'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import useRefetch from "@/hooks/use-refetch";
type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
 
  const refetch = useRefetch();
  async function onSubmit(data: FormInput) {
    try {
      await createProject.mutateAsync({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      }, {
        onSuccess: () => {
          toast.success("Project Created");
          refetch();
          reset();
        }
      });
       
    } catch {
      toast.error("Failed to create project");
    }
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/bg.svg" alt="Background" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">Link your GitHub Repository</h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to Dionysus
          </p>
        </div>
        <div className="h-4"></div>
        <form onSubmit={handleSubmit(onSubmit)} className="gap-4">
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
          />
          <Input
            {...register("repoUrl", { required: true })}
            placeholder="GitHub URL"
            required
          />
          <Input
            {...register("githubToken")}
            placeholder="GitHub Token (Optional)"
          />
          <div className="h-4"></div>
          <Button type="submit" disabled = {createProject.isPending}>Create Project</Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
