import { users, contents, type User, type Content, type InsertUser, type InsertContent,
  UserRole, Department, type UserRoleType, type DepartmentType } from "@shared/schema";
import { IStorage } from "@shared/index";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  currentId: number;
  currentContentId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.currentId = 1;
    this.currentContentId = 1;
  }

  // ===== User Methods =====
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = {
      id,
      uid: insertUser.uid,
      email: insertUser.email,
      username: insertUser.username,
      displayName: insertUser.displayName,
      role: insertUser.role as UserRoleType,
      department: insertUser.department as DepartmentType || null,
      studentId: insertUser.studentId || null,
      profilePicture: insertUser.profilePicture || null,
      createdAt: new Date()
    } as User;
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // ===== Content Methods =====
  
  async getAllContent(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }
  
  async getContentById(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContentByType(contentType: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      content => content.contentType === contentType
    );
  }
  
  async getContentByDepartment(department: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      content => content.department === department
    );
  }
  
  async createContent(content: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const now = new Date();
    const newContent = {
      id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      department: content.department,
      fileUrl: content.fileUrl,
      externalLink: content.externalLink,
      authorId: content.authorId,
      authorName: content.authorName,
      studentYear: content.studentYear,
      thumbnailUrl: content.thumbnailUrl,
      createdAt: now,
      updatedAt: now
    } as Content;
    
    this.contents.set(id, newContent);
    return newContent;
  }
  
  async updateContent(id: number, content: Partial<InsertContent>): Promise<Content | null> {
    const existingContent = this.contents.get(id);
    if (!existingContent) {
      return null;
    }
    
    const updatedContent = {
      ...existingContent,
      ...content,
      updatedAt: new Date()
    } as Content;
    
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Use raw SQL to avoid type issues
    const result = await db.execute(sql`
      INSERT INTO users (uid, email, username, display_name, role, department, student_id, profile_picture)
      VALUES (
        ${insertUser.uid},
        ${insertUser.email},
        ${insertUser.username},
        ${insertUser.displayName},
        ${insertUser.role},
        ${insertUser.department || null},
        ${insertUser.studentId || null},
        ${insertUser.profilePicture || null}
      )
      RETURNING *
    `);
    
    return result.rows[0] as User;
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(contents).orderBy(desc(contents.createdAt));
  }

  async getContentById(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentByType(contentType: string): Promise<Content[]> {
    // Use a properly typed contentType value
    return await db.select()
      .from(contents)
      .where(contentType === "article" ? 
        eq(contents.contentType, "article") :
        contentType === "ebook" ?
        eq(contents.contentType, "ebook") :
        eq(contents.contentType, "project"))
      .orderBy(desc(contents.createdAt));
  }

  async getContentByDepartment(department: string): Promise<Content[]> {
    // Use properly typed department value
    let deptFilter;
    switch(department) {
      case "horticulture":
        deptFilter = eq(contents.department, "horticulture");
        break;
      case "crops":
        deptFilter = eq(contents.department, "crops");
        break;
      case "soil":
        deptFilter = eq(contents.department, "soil");
        break;
      case "protection":
        deptFilter = eq(contents.department, "protection");
        break;
      default:
        deptFilter = eq(contents.department, "other");
    }
    
    return await db.select()
      .from(contents)
      .where(deptFilter)
      .orderBy(desc(contents.createdAt));
  }

  async createContent(content: InsertContent): Promise<Content> {
    // Use raw SQL to avoid type issues
    const result = await db.execute(sql`
      INSERT INTO contents (
        title, description, content_type, department, 
        file_url, article_text_path, external_link, 
        author_id, author_name, student_year, thumbnail_url
      )
      VALUES (
        ${content.title},
        ${content.description},
        ${content.contentType},
        ${content.department || null},
        ${content.fileUrl || null},
        ${content.articleTextPath || null},
        ${content.externalLink || null},
        ${content.authorId || null},
        ${content.authorName},
        ${content.studentYear || null},
        ${content.thumbnailUrl || null}
      )
      RETURNING *
    `);
    
    return result.rows[0] as Content;
  }

  async updateContent(id: number, contentUpdate: Partial<InsertContent>): Promise<Content | null> {
    // First get the existing content to properly merge and maintain types
    const [existingContent] = await db.select().from(contents).where(eq(contents.id, id));
    
    if (!existingContent) {
      return null;
    }
    
    // Use SQL template tag to create a safe SQL query with parameters
    const result = await db.execute(sql`
      UPDATE contents
      SET
        updated_at = NOW(),
        title = CASE WHEN ${contentUpdate.title !== undefined} THEN ${contentUpdate.title || null} ELSE title END,
        description = CASE WHEN ${contentUpdate.description !== undefined} THEN ${contentUpdate.description || null} ELSE description END,
        content_type = CASE WHEN ${contentUpdate.contentType !== undefined} THEN ${contentUpdate.contentType || null} ELSE content_type END,
        department = CASE WHEN ${contentUpdate.department !== undefined} THEN ${contentUpdate.department || null} ELSE department END,
        file_url = CASE WHEN ${contentUpdate.fileUrl !== undefined} THEN ${contentUpdate.fileUrl || null} ELSE file_url END,
        article_text_path = CASE WHEN ${contentUpdate.articleTextPath !== undefined} THEN ${contentUpdate.articleTextPath || null} ELSE article_text_path END,
        external_link = CASE WHEN ${contentUpdate.externalLink !== undefined} THEN ${contentUpdate.externalLink || null} ELSE external_link END,
        author_id = CASE WHEN ${contentUpdate.authorId !== undefined} THEN ${contentUpdate.authorId || null} ELSE author_id END,
        author_name = CASE WHEN ${contentUpdate.authorName !== undefined} THEN ${contentUpdate.authorName || null} ELSE author_name END,
        student_year = CASE WHEN ${contentUpdate.studentYear !== undefined} THEN ${contentUpdate.studentYear || null} ELSE student_year END,
        thumbnail_url = CASE WHEN ${contentUpdate.thumbnailUrl !== undefined} THEN ${contentUpdate.thumbnailUrl || null} ELSE thumbnail_url END
      WHERE id = ${id}
      RETURNING *
    `);
    
    return result.rows.length > 0 ? result.rows[0] as Content : null;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await db.delete(contents).where(eq(contents.id, id));
    return true; // In case no exception occurs, we assume the operation was successful
  }
}

// استخدم DatabaseStorage بدلاً من MemStorage
export const storage = new DatabaseStorage();
