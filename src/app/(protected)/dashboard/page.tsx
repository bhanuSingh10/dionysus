"use client";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
// 1.24
const DashboardPage = () => {
  const { user } = useUser();
  const { project } = useProject();

  return (
    <div className="">
      {project?.id}
      <div className="flex flex-wrap items-center justify-between gap-y-4 ">
        {/* github link */}
        <div className="rounded-2xl w-fit text-black bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                The project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl ?? "GitHub"}
                  <ExternalLink />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          team Member
          invite button
          archive button
        </div>
      </div>
     <div className="mt-4">
        <div className="grid grid-cols-4 sm:grid-cols-5">
          ask questioncard 
          meeting card
        </div>
      </div>
      <div className="mt-8">commit logs</div>
    </div>
  );
};

export default DashboardPage;
