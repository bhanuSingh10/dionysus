// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

function meToTime(ms: number) {
  const seconed = ms / 1000;
  const minutes = Math.floor(seconed / 60);
  const remainingSeconds = Math.floor(seconed % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const processMeeting = async (meetingsUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio: meetingsUrl,
    auto_chapters: true,
  });
  const summaries =
    transcript.chapters?.map((chapter) => ({
      start: meToTime(chapter.start),
      end: meToTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    })) || [];

  if (!transcript.text) throw new Error("No transcript found");
  return {
    summaries,
  };
};

// const FILE_URL =
//   'https://assembly.ai/sports_injuries.mp3';

//   const response = await processMeeting(FILE_URL);

//   console.log(response)
