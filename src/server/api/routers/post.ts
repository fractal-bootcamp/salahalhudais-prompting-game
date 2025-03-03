import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { artPieces } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(artPieces).values({
        title: input.name,
        config: {},
        userId: "anonymous",
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.artPieces.findFirst({
      orderBy: (pieces, { desc }) => [desc(pieces.createdAt)],
    });

    return post ?? null;
  }),
});
