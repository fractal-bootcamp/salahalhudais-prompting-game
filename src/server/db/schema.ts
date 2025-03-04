// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  json,
  primaryKey,
  text,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `generative-art_${name}`);

// Users table
export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    firstName: varchar("first_name", { length: 256 }),
    lastName: varchar("last_name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (user) => ({
    usernameIndex: index("username_idx").on(user.username),
  })
);

// Art pieces table
export const artPieces = createTable(
  "art_piece",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 256 }).notNull(),
    config: json("config").notNull(), // Store the configuration used to generate the art
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (artPiece) => ({
    userIdIndex: index("art_piece_user_id_idx").on(artPiece.userId),
  })
);

// Likes table
export const likes = createTable(
  "like",
  {
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    artPieceId: integer("art_piece_id")
      .notNull()
      .references(() => artPieces.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (like) => ({
    pk: primaryKey({ columns: [like.userId, like.artPieceId] }),
    artPieceIdIndex: index("like_art_piece_id_idx").on(like.artPieceId),
  })
);

// Game target images table
export const gameImages = createTable(
  "game_image",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    imagePath: varchar("image_path", { length: 512 }).notNull(),
    originalPrompt: text("original_prompt").notNull(), // The prompt used to generate this image
    difficulty: integer("difficulty").default(1), // Difficulty level (1-5)
    active: boolean("active").default(true), // Whether this image is active in the game
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (gameImage) => ({
    imagePathIndex: index("game_image_path_idx").on(gameImage.imagePath),
  })
);

// Game prompts table - stores all prompts submitted for a game image
export const gamePrompts = createTable(
  "game_prompt",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    gameImageId: integer("game_image_id")
      .notNull()
      .references(() => gameImages.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    promptText: text("prompt_text").notNull(),
    generatedImagePath: varchar("generated_image_path", { length: 512 }),
    similarityScore: real("similarity_score"), // Score from 0-100
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (gamePrompt) => ({
    gameImageIdIndex: index("game_prompt_image_id_idx").on(gamePrompt.gameImageId),
    userIdIndex: index("game_prompt_user_id_idx").on(gamePrompt.userId),
    uniquePromptPerImage: index("unique_prompt_per_image_idx").on(
      gamePrompt.gameImageId,
      gamePrompt.promptText
    ),
  })
);

// Game leaderboard table
export const gameLeaderboard = createTable(
  "game_leaderboard",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameImageId: integer("game_image_id")
      .notNull()
      .references(() => gameImages.id, { onDelete: "cascade" }),
    bestScore: real("best_score").notNull(),
    promptId: integer("prompt_id")
      .notNull()
      .references(() => gamePrompts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (leaderboard) => ({
    userIdIndex: index("game_leaderboard_user_id_idx").on(leaderboard.userId),
    gameImageIdIndex: index("game_leaderboard_image_id_idx").on(leaderboard.gameImageId),
    uniqueUserPerImage: index("unique_user_per_image_idx").on(
      leaderboard.userId,
      leaderboard.gameImageId
    ),
  })
);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  artPieces: many(artPieces),
  likes: many(likes),
  gamePrompts: many(gamePrompts),
  leaderboardEntries: many(gameLeaderboard),
}));

export const artPiecesRelations = relations(artPieces, ({ one, many }) => ({
  user: one(users, {
    fields: [artPieces.userId],
    references: [users.id],
  }),
  likes: many(likes),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  artPiece: one(artPieces, {
    fields: [likes.artPieceId],
    references: [artPieces.id],
  }),
}));

export const gameImagesRelations = relations(gameImages, ({ many }) => ({
  prompts: many(gamePrompts),
  leaderboardEntries: many(gameLeaderboard),
}));

export const gamePromptsRelations = relations(gamePrompts, ({ one, many }) => ({
  gameImage: one(gameImages, {
    fields: [gamePrompts.gameImageId],
    references: [gameImages.id],
  }),
  user: one(users, {
    fields: [gamePrompts.userId],
    references: [users.id],
  }),
  leaderboardEntries: many(gameLeaderboard, {
    relationName: "prompt_leaderboard",
  }),
}));

export const gameLeaderboardRelations = relations(gameLeaderboard, ({ one }) => ({
  user: one(users, {
    fields: [gameLeaderboard.userId],
    references: [users.id],
  }),
  gameImage: one(gameImages, {
    fields: [gameLeaderboard.gameImageId],
    references: [gameImages.id],
  }),
  prompt: one(gamePrompts, {
    fields: [gameLeaderboard.promptId],
    references: [gamePrompts.id],
    relationName: "prompt_leaderboard",
  }),
}));

