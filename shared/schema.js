import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// User roles enum
export const UserRole = {
    STUDENT: "student",
    PROFESSOR: "professor",
    ADMIN: "admin",
};
// Department enum
export const Department = {
    HORTICULTURE: "horticulture",
    CROPS: "crops",
    SOIL: "soil",
    PROTECTION: "protection",
    OTHER: "other",
};
// Content types enum
export const ContentType = {
    ARTICLE: "article",
    EBOOK: "ebook",
    PROJECT: "project",
};
// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    uid: text("uid").notNull().unique(), // Firebase UID
    email: text("email").notNull().unique(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull().$type(),
    department: text("department").$type(),
    studentId: text("student_id"),
    profilePicture: text("profile_picture"),
    createdAt: timestamp("created_at").defaultNow(),
});
// Content table (for articles, e-books, graduation projects)
export const contents = pgTable("contents", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    contentType: text("content_type").notNull().$type(),
    department: text("department").$type(),
    fileUrl: text("file_url"),
    articleTextPath: text("article_text_path"), // New field for storing article text file path
    externalLink: text("external_link"),
    authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    studentYear: text("student_year"), // For graduation projects
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
});
// Schema for inserting content
export const insertContentSchema = createInsertSchema(contents).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// إضافة حقل نص المقال الذي سيتم استخدامه في واجهة المستخدم فقط (غير مخزن في قاعدة البيانات)
export const extendedInsertContentSchema = insertContentSchema.extend({
    articleText: z.string().optional(),
});
