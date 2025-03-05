import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { gameImages, gamePrompts, users } from "~/server/db/schema";
import { eq, and, desc, sql, inArray, count, asc, not, like } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { generateImage, calculateSimilarity } from "~/lib/imageGeneration";
import { comparePrompts } from "~/lib/imageGeneration";

export const gameRouter = createTRPCRouter({
  // Get a random game image that the user hasn't played yet
  getRandomImage: protectedProcedure.query(async ({ ctx }) => {
    const user = await currentUser();
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to play the game",
      });
    }

    // Find images the user has already played
    const playedImages = await ctx.db
      .select({ gameImageId: gamePrompts.gameImageId })
      .from(gamePrompts)
      .where(eq(gamePrompts.userId, user.id));

    const playedImageIds = playedImages.map((img) => img.gameImageId);

    // Get a random image the user hasn't played yet
    let gameImage;
    
    if (playedImageIds.length > 0) {
      // If the user has played some images, get one they haven't played
      gameImage = await ctx.db.query.gameImages.findFirst({
        where: and(
          not(inArray(gameImages.id, playedImageIds)),
          eq(gameImages.active, true)
        ),
        orderBy: sql`RANDOM()`,
      });
    } else {
      // If the user hasn't played any images, get any random active image
      gameImage = await ctx.db.query.gameImages.findFirst({
        where: eq(gameImages.active, true),
        orderBy: sql`RANDOM()`,
      });
    }

    // If no unplayed images are found, get any random image
    if (!gameImage) {
      gameImage = await ctx.db.query.gameImages.findFirst({
        where: eq(gameImages.active, true),
        orderBy: sql`RANDOM()`,
      });
      
      if (!gameImage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No game images available",
        });
      }
    }

    // Get all previously used prompts for this image
    const usedPrompts = await ctx.db
      .select({ promptText: gamePrompts.promptText })
      .from(gamePrompts)
      .where(eq(gamePrompts.gameImageId, gameImage.id));

    return {
      gameImage,
      usedPrompts: usedPrompts.map((p) => p.promptText),
    };
  }),

  // Submit a prompt for a game image
  submitPrompt: protectedProcedure
    .input(
      z.object({
        gameImageId: z.number(),
        promptText: z.string().min(3).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to play the game",
        });
      }

      // Get the game image and its original prompt
      const gameImage = await ctx.db.query.gameImages.findFirst({
        where: eq(gameImages.id, input.gameImageId),
      });

      if (!gameImage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game image not found",
        });
      }

      if (!gameImage?.originalPrompt) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Game image prompt not found",
        });
      }

      // Check if this exact prompt has been used before
      const existingPrompt = await ctx.db.query.gamePrompts.findFirst({
        where: and(
          eq(gamePrompts.gameImageId, input.gameImageId),
          eq(gamePrompts.promptText, input.promptText)
        ),
      });

      if (existingPrompt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This exact prompt has already been used for this image",
        });
      }

      // Compare the user's prompt with the original prompt
      const similarityScore = await comparePrompts(
        gameImage.originalPrompt,
        input.promptText
      );

      // Get all existing prompts for this image
      const existingPrompts = await ctx.db
        .select({ promptText: gamePrompts.promptText })
        .from(gamePrompts)
        .where(eq(gamePrompts.gameImageId, input.gameImageId));

      // Check similarity with existing prompts
      const existingPromptSimilarities = await Promise.all(
        existingPrompts.map(p => comparePrompts(p.promptText, input.promptText))
      );

      // If the prompt is too similar to any existing prompt (>90% similarity)
      if (existingPromptSimilarities.some(score => score > 90)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your prompt is too similar to an existing one. Try to be more unique!",
        });
      }

      // Save the prompt and score
      const newPrompt = await ctx.db
        .insert(gamePrompts)
        .values({
          gameImageId: input.gameImageId,
          userId: user.id,
          promptText: input.promptText,
          similarityScore,
        })
        .returning();

      if (!newPrompt[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create prompt record",
        });
      }

      const promptId = newPrompt[0].id;


      return {
        prompt: newPrompt[0],
        originalImage: gameImage,
        similarityScore,
      };
    }),

  // Get user's game history
  getUserHistory: protectedProcedure.query(async ({ ctx }) => {
    const user = await currentUser();
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view your history",
      });
    }

    const history = await ctx.db.query.gamePrompts.findMany({
      where: eq(gamePrompts.userId, user.id),
      orderBy: [desc(gamePrompts.createdAt)],
      with: {
        gameImage: true,
      },
    });

    return history;
  }),

  // Get all game images for admin
  getAllImages: protectedProcedure.query(async ({ ctx }) => {
    const user = await currentUser();
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view game images",
      });
    }

    // TODO: Add admin check here

    const images = await ctx.db.query.gameImages.findMany({
      orderBy: [desc(gameImages.createdAt)],
    });

    return images;
  }),

  // Add a new game image (admin only)
  addGameImage: protectedProcedure
    .input(
      z.object({
        imagePath: z.string(),
        originalPrompt: z.string(),
        difficulty: z.number().min(1).max(5).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add game images",
        });
      }

      // TODO: Add admin check here

      const newImage = await ctx.db
        .insert(gameImages)
        .values({
          imagePath: input.imagePath,
          originalPrompt: input.originalPrompt,
          difficulty: input.difficulty,
          targetWords: [],
        })
        .returning();

      return newImage[0];
    }),
}); 