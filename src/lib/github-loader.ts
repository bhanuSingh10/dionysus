import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import {generateEmbedding, summariseCode} from "@/lib/gemini";
import { db } from "@/server/db";
export  const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();
  return docs;
};

// Wrap in an async function to use await at the top level
// (async () => {
//   const result = await loadGithubRepo("https://github.com/elliott-chong/chatpdf-yt");
//   console.log(result);
// })();

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async doc => {
    const summary = await summariseCode(doc); 

    // ///////
    console.log(`Summary for ${doc.metadata?.source}:`, summary);    
    if (!summary) {
      console.warn(`Skipping document ${doc.metadata?.source} due to empty summary`);
      return null;
    }
    const embedding = await generateEmbedding(summary); 
    
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata?.source || "unknown",
    };
  }));
}

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
          
        },
      });
      
   


      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id};
      `; 
    })
  );
};


