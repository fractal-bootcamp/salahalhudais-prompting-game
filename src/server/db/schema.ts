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

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  artPieces: many(artPieces),
  likes: many(likes),
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
