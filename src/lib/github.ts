import { db } from "@/server/db";
import { Axis3D, LucideChartNoAxesColumnIncreasing } from "lucide-react";
import axios from "axios";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = "https://github.com/vercel/next.js";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};
 

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  console.log("GitHub URL:", githubUrl);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author?.date || "").getTime() -
      new Date(a.commit.author?.date || "").getTime(),
  );

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit.author?.name || "Unknown",
    commitAuthorAvatar: commit.author?.avatar_url || "",
    commitDate: commit.commit.author?.date || "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unproccessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  ) ;
  console.log("commitHashes-----", commitHashes);
  console.log("unproccessedCommits-----", unproccessedCommits);
 
  const summariesResponses = await Promise.allSettled(unproccessedCommits.map((commit) =>
    summariseCommit(githubUrl, commit.commitHash)));
  console.log("summaresResponse------",summariesResponses);
  const summaries = summariesResponses.map((response) => {
    if(response.status === "fulfilled") {
      return response.value;
    }
    return "Failed to summarise commit";
  });
  console.log("summaries----",summaries)

  
  // const summaryResponses = await Promise.allSettled(unproccessedCommits.map((commit) =>
  //   summariseCommit(githubUrl, commit.commitHash) 
  // ));
  // const summaries = summaryResponses.map((response, index) =>{
  //   if (response.status === "fulfilled") {
  //     return response.value;
  //   }
  //   return `Failed to summarise commit`;
  // });

  const commit = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commit ${index}`);
      return {
        projectId: projectId,
        commitHash: unproccessedCommits[index]!.commitHash,
        commitMessage: unproccessedCommits[index]!.commitMessage,
        commitAuthorName: unproccessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unproccessedCommits[index]!.commitAuthorAvatar,
        commitDate: unproccessedCommits[index]!.commitDate,
        summary,
      }
    }),
  })
  return  commit;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  console.log("GitHub Token:", process.env.GITHUB_ACCESS_TOKEN ? "Loaded" : "Not Loaded");

  const response = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.diff",
    },
  });
 

  return await aiSummariseCommit(response.data) || "No summary available";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const proccessedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
  const unproccessedCommits = commitHashes.filter(
    (commit) =>
      !proccessedCommits.some(
        (proccessedCommit) => proccessedCommit.commitHash === commit.commitHash,
      ),
  );
  return unproccessedCommits;
}

// await pollCommits("cm7ubxskc0000119ns2rlq2za").then(console.log);
