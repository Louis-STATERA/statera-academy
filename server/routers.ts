import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getProgressByUserId, upsertProgress, getDiplomasByUserId, createDiploma, updateDiplomaUrl } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== Progress =====
  progress: router({
    /** Get current user's progress */
    get: protectedProcedure.query(async ({ ctx }) => {
      const row = await getProgressByUserId(ctx.user.id);
      return row ? row.progressData : null;
    }),

    /** Save/update current user's progress */
    save: protectedProcedure
      .input(z.object({
        completedModules: z.array(z.string()),
        moduleScores: z.record(z.string(), z.number()),
        totalXP: z.number(),
        badges: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertProgress(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ===== Diplomas =====
  diploma: router({
    /** List all diplomas for current user */
    list: protectedProcedure.query(async ({ ctx }) => {
      return getDiplomasByUserId(ctx.user.id);
    }),

    /** Create a new diploma record */
    create: protectedProcedure
      .input(z.object({
        userName: z.string().min(1),
        avgScore: z.number(),
        totalXP: z.number(),
        levelNumber: z.number(),
        certificateNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const certNumber = input.certificateNumber || `STA-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
        const now = Date.now();
        const expiresAt = now + (365 * 24 * 60 * 60 * 1000); // 12 months

        await createDiploma({
          userId: ctx.user.id,
          userName: input.userName,
          certificateNumber: certNumber,
          avgScore: input.avgScore,
          totalXP: input.totalXP,
          levelNumber: input.levelNumber,
          issuedAt: now,
          expiresAt,
        });

        // Fetch the newly created diploma
        const diplomas = await getDiplomasByUserId(ctx.user.id);
        const latest = diplomas[diplomas.length - 1];

        return {
          success: true,
          diploma: latest,
        };
      }),

    /** Upload diploma image to S3 and update the record */
    uploadImage: protectedProcedure
      .input(z.object({
        diplomaId: z.number(),
        /** Base64-encoded image data */
        imageData: z.string(),
        format: z.enum(["jpg", "png"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.imageData, "base64");
        const contentType = input.format === "jpg" ? "image/jpeg" : "image/png";
        const suffix = nanoid(8);
        const fileKey = `diplomas/${ctx.user.id}/${input.diplomaId}-${suffix}.${input.format}`;

        const { url } = await storagePut(fileKey, buffer, contentType);
        await updateDiplomaUrl(input.diplomaId, url, fileKey);

        return { success: true, url };
      }),
  }),

  // ===== Reports =====
  report: router({
    /** Upload a progress report to S3 */
    upload: protectedProcedure
      .input(z.object({
        /** HTML content of the report */
        content: z.string(),
        userName: z.string().min(1),
        format: z.enum(["html", "txt"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const suffix = nanoid(8);
        const contentType = input.format === "html" ? "text/html" : "text/plain";
        const ext = input.format;
        const fileKey = `reports/${ctx.user.id}/rapport-${suffix}.${ext}`;

        const { url } = await storagePut(fileKey, input.content, contentType);

        return { success: true, url, fileKey };
      }),

    /** Send progress report notification to RSSI */
    sendToRSSI: protectedProcedure
      .input(z.object({
        userName: z.string().min(1),
        reportSummary: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Use the notification system to alert the project owner (RSSI)
        const sent = await notifyOwner({
          title: `📊 Rapport de formation cyber - ${input.userName}`,
          content: input.reportSummary,
        });

        return { success: sent };
      }),
  }),
});

export type AppRouter = typeof appRouter;
