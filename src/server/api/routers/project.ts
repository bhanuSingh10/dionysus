import { pollCommits } from "@/lib/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { indexGithubRepo } from "@/lib/github-loader";
import { create } from "domain";

export const projectRouter = createTRPCRouter({
  // Create a new project
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        githubUrl: z.string().url("Invalid GitHub URL"),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create a new project in DB
        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
            userToProjects: {
              create: {
                userId: ctx.user.userId!, // Ensure userId is valid
              },
            },
          },
        });

        // Index GitHub repository
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
          .then()
          .catch(console.error);

        // Poll commits in background
        await pollCommits(project.id).catch(console.error);

        return project;
      } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project.");
      }
    }),

  // Get user-specific projects
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.userId) {
      throw new Error("User ID is required.");
    }

    try {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null, // Ensure project isn't soft deleted
        },
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Failed to fetch projects.");
    }
  }),

  // Get commits for a project
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        if (!input.projectId) {
          throw new Error("Invalid project ID.");
        }

        // Poll commits asynchronously
        pollCommits(input.projectId).catch(console.error);

        return await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
          },
        });
      } catch (error) {
        console.error("Error fetching commits:", error);
        throw new Error("Failed to fetch commits.");
      }
    }),
  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Your mutation logic here
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),
  getQuestions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
          status: "PROCESSING",
        },
      });
      return meeting;
    }),
  getMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          issues: true,
        },
      });
    }),
  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),
  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: { issues: true },
      });
    }),
  archivedProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: { id: input.projectId },
        data: { deletedAt: new Date() },
      });
    }),
  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
      });
    }),
});
