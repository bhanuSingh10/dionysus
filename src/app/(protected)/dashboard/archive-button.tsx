"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archivedProject.useMutation();
  const { project, projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archiveProject.isPending}
      size={"sm"}
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm("Are you sure to archive this project?");
        if (confirm)
          archiveProject.mutate(
            { projectId: projectId },
            {
              onSuccess: () => {
                toast.success("Project archived");
                refetch();
              },
              onError: () => {
                toast.error("Fialed to archive project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
