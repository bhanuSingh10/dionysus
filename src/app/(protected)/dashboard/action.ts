"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  // Generate embedding for the input question
  const queryVector = await generateEmbedding(question);
  console.log("queryVector------", queryVector);
  const vectorQuery = `[${queryVector.join(",")}]`;

  console.log("vectorQuery------", vectorQuery);
  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary", 
           1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity 
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10`) as { fileName: string; sourceCode: string; summary: string }[];

  console.log("Query Result------------------------:", result);
  let context = "";
  // Constructing context from query results
  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
  }


  // Generating AI Response
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
    You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern. 
    
    ### AI Assistant's Characteristics:
    - You are a brand-new, powerful, human-like artificial intelligence.
    - You possess expert knowledge, helpfulness, cleverness, and articulateness.
    - You are always friendly, kind, and inspiring, eager to provide vivid and thoughtful responses.
    - You do not invent information that is not drawn directly from the provided context.
    
    ### Response Guidelines:
    1. **Context Handling:**  
       - If a **CONTEXT BLOCK** is provided, use it to answer the question.  
       - If the context does not contain the answer, say:  
         **"I'm sorry, but I don't know the answer based on the provided context."**  
       - Do not apologize for previous responses; instead, acknowledge newly gained information.
    
    2. **Code-Specific Answers:**  
       - If the question is about code or a specific file, provide a **detailed step-by-step answer**.  
       - Use **markdown syntax** for formatting. Include **code snippets** when necessary.  
       - Ensure clarity and completeness, avoiding ambiguity.  
    
    ### Input Format:
    **START CONTEXT BLOCK**  
    ${context}  
    **END OF CONTEXT BLOCK**
    
    **START QUESTION**  
    ${question}  
    **END OF QUESTION**  
    
    Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.
      `,
    });

    for await (const text of textStream) {
      stream.update(text);
    }
    stream.done();
  })();

  return {
    output: stream.value,
    fileReference: result,
  };
}
