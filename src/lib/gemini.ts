import { GoogleGenerativeAI } from '@google/generative-ai';

const gemini_api_key = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(gemini_api_key);
const modal = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

export const aiSummariseCommit = async (diff: string) => {
    const response = await modal.generateContent([ 
       `You are an expert programmer, and you are trying to summarize a git diff.  
        
Reminders about the diff format:  
- Every file has a few metadata lines, like (for example):  

\`\`\`
diff --git a/lib/index.js b/lib/index.js  
index aadf691..bfefe03 100644  
--- a/lib/index.js  
+++ b/lib/index.js  
\`\`\`

This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.  
Then there is a specifier of the lines that were modified:  
- A line starting with \`+\` means it was added.  
- A line starting with \`-\` means it was deleted.  
- A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.  
  It is not part of the diff.  

---

**EXAMPLE SUMMARY COMMENTS:**  

- Raised the amount of returned recordings from \`10\` to \`100\` [\`packages/server/recordings_api.ts\`], [\`packages/server/constants.ts\`]  
- Fixed a typo in the GitHub Action name [\`.github/workflows/gpt-commit-summarizer.yml\`]  
- Moved the \`octokit\` initialization to a separate file [\`src/octokit.ts\`], [\`src/index.ts\`]  
- Added an OpenAI API for completions [\`packages/utils/apis/openai.ts\`]  
- Lowered numeric tolerance for test files  

Most commits will have fewer comments than this example list.  
The last comment does not include the file names if there are more than two relevant files in the commit.  

Do **not** include parts of the example in your summary.  
It is given **only** as an example of appropriate comments.  

---

Please summarize the following diff file:  

\`\`\`\n\n${diff}\n\`\`\``
    ]);

    // ✅ Correct way to extract the response text
    const text = response.response.text(); 

    return text;
};

// ✅ Testing the function
// console.log(await summariseCommits(`
// diff --git a/src/components/Navbar.tsx b/src/components/Navbar.tsx
// index 123abc4..456def7 100644
// --- a/src/components/Navbar.tsx
// +++ b/src/components/Navbar.tsx
// @@ -5,6 +5,7 @@ import React from 'react';
//  import Link from 'next/link';

//  const Navbar = () => {
// +  const isLoggedIn = false;
//    return (
//      <nav>
//        <ul>
// @@ -12,6 +13,10 @@ const Navbar = () => {
//            <Link href="/">Home</Link>
//          </li>
//          <li>
// +          {isLoggedIn ? (
// +            <Link href="/dashboard">Dashboard</Link>
// +          ) : (
// +            <Link href="/login">Login</Link>
// +          )}
//          </li>
//        </ul>
//      </nav>
// `));
