// src/server/api/routers/art.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { artPieces, likes, users } from "~/server/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const artRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const user = await currentUser();
      const userId = user?.id;

      // First, check if we have any art pieces
      const arts = await ctx.db.query.artPieces.findMany({
        orderBy: [desc(artPieces.createdAt)],
        with: {
          user: true,
        },
      });

      if (arts.length === 0) {
        // If no art pieces exist, return an empty array
        return [];
      }

      // Count likes for each art piece
      const artIds = arts.map((art) => art.id);
      const likeCounts = await ctx.db
        .select({
          artPieceId: likes.artPieceId,
          count: sql<number>`count(*)`,
        })
        .from(likes)
        .where(inArray(likes.artPieceId, artIds))
        .groupBy(likes.artPieceId);

      // Check if current user has liked each art piece
      const userLikes = userId
        ? await ctx.db
            .select({ artPieceId: likes.artPieceId })
            .from(likes)
            .where(and(eq(likes.userId, userId), inArray(likes.artPieceId, artIds)))
        : [];

      const likeCountMap = new Map(
        likeCounts.map((l) => [l.artPieceId, l.count])
      );
      const userLikeSet = new Set(userLikes.map((l) => l.artPieceId));

      return arts.map((art) => ({
        ...art,
        likeCount: likeCountMap.get(art.id) ?? 0,
        isLiked: userLikeSet.has(art.id),
      }));
    } catch (error) {
      console.error("Error in getAll:", error);
      
      // Return an empty array instead of throwing an error
      // This allows the UI to render without crashing
      return [];
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check if user exists in our database
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      
      // If not, create the user
      if (!existingUser) {
        try {
          // Try to create user with their Clerk username
          const baseUsername = user.username ?? `user${user.id.substring(0, 8)}`;
          
          await ctx.db.insert(users).values({
            id: user.id,
            username: baseUsername,
          });
        } catch (error) {
          // If there's a unique constraint error, create with a timestamp suffix
          if (error instanceof Error && error.message.includes('unique constraint')) {
            const uniqueUsername = `${user.username ?? `user${user.id.substring(0, 8)}`}_${Date.now()}`;
            
            await ctx.db.insert(users).values({
              id: user.id,
              username: uniqueUsername,
            });
          } else {
            // If it's some other error, rethrow it
            throw error;
          }
        }
      }
      
      // Create the art piece
      await ctx.db.insert(artPieces).values({
        title: input.title,
        config: input.config,
        userId: user.id,
      });
    }),

  like: protectedProcedure
    .input(z.object({ artPieceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check if user exists in our database
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      
      // If not, create the user
      if (!existingUser) {
        try {
          // Try to create user with their Clerk username
          const baseUsername = user.username ?? `user${user.id.substring(0, 8)}`;
          
          await ctx.db.insert(users).values({
            id: user.id,
            username: baseUsername,
          });
        } catch (error) {
          // If there's a unique constraint error, create with a timestamp suffix
          if (error instanceof Error && error.message.includes('unique constraint')) {
            const uniqueUsername = `${user.username ?? `user${user.id.substring(0, 8)}`}_${Date.now()}`;
            
            await ctx.db.insert(users).values({
              id: user.id,
              username: uniqueUsername,
            });
          } else {
            // If it's some other error, rethrow it
            throw error;
          }
        }
      }
      
      // Check if already liked
      const existingLike = await ctx.db.query.likes.findFirst({
        where: and(
          eq(likes.userId, user.id),
          eq(likes.artPieceId, input.artPieceId)
        ),
      });
      
      if (!existingLike) {
        await ctx.db.insert(likes).values({
          userId: user.id,
          artPieceId: input.artPieceId,
        });
      }
    }),

  unlike: protectedProcedure
    .input(z.object({ artPieceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check if user exists in our database
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      
      // If not, create the user (same as in like mutation)
      if (!existingUser) {
        try {
          const baseUsername = user.username ?? `user${user.id.substring(0, 8)}`;
          
          await ctx.db.insert(users).values({
            id: user.id,
            username: baseUsername,
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('unique constraint')) {
            const uniqueUsername = `${user.username ?? `user${user.id.substring(0, 8)}`}_${Date.now()}`;
            
            await ctx.db.insert(users).values({
              id: user.id,
              username: uniqueUsername,
            });
          } else {
            throw error;
          }
        }
      }
      
      await ctx.db
        .delete(likes)
        .where(
          and(
            eq(likes.userId, user.id),
            eq(likes.artPieceId, input.artPieceId)
          )
        );
    }),
});