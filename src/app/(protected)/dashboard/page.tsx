"use client";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { Archive, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import dynamic from "next/dynamic";
// import InviteButton from "./invite-button";
const InviteButton = dynamic(()=>import("./invite-button"), {
  ssr: false,
});
// 1.24
const DashboardPage = () => {
  const { user } = useUser();
  const { project, projects } = useProject();

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* github link */}
        <div className="w-fit rounded-2xl bg-primary px-4 py-3 text-black">
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
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8">
        <CommitLog />
      </div>
    </div>
  );
};

export default DashboardPage;
