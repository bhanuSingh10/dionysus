import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { start } from "repl";
import z from "zod"
const bodyParser = z.object({
    projectId: z.string(),
    meetingUrl: z.string(),
    meetingId: z.string()
})

export const maxDuration = 3000;

export async function POST(req: NextRequest) {
    const {userId} = await auth();
    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})

    }

    try {
        const body = await req.json();
        const {meetingUrl, projectId, meetingId} = bodyParser.parse(body);
        // const summaries: { start: string, end: string, gist: string, headline: string, summary: string }[] = await processMeeting(meetingUrl)
        const result = await processMeeting(meetingUrl);
        if (!result || !result.summaries) {
            throw new Error("Failed to process meeting");
        }
        const summaries: { start: string, end: string, gist: string, headline: string, summary: string }[] = result.summaries.filter((summary: any): summary is { start: string, end: string, gist: string, headline: string, summary: string } => !!summary);
        if (summaries.length === 0) {
            throw new Error("No valid summaries found");
        }        
        await db.issue.createMany({
            data: summaries.map((summary)=>({
               start: summary.start,
               end: summary.end,
               gist: summary.gist,
               headline: summary.headline,
                summary: summary.summary,
                meetingId,
                
            }))
             
        })
        await db.meeting.update({
            where: {id: meetingId}, data: {
                status: "COMPLETED",
                name: summaries[0]!.headline
            }
        })
        return NextResponse.json({success: true}, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
        
    }

}