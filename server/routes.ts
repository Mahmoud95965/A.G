import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { upload, handleUploadErrors, deleteFile, getFilePath } from "./fileStorage";
import { saveArticleText, readArticleText, convertArticleToPdf, ensureContentDirectories } from "./contentStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints prefix
  const apiPrefix = '/api';

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // عدد المستخدمين
  app.get(`${apiPrefix}/users/count`, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ count: users.length });
    } catch (error) {
      res.status(500).json({ message: 'Failed to count users', error: (error as Error).message });
    }
  });

  // User routes
  app.get(`${apiPrefix}/users`, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user', error: (error as Error).message });
    }
  });

  // Content routes
  app.get(`${apiPrefix}/content`, async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content', error: (error as Error).message });
    }
  });
  
  // مسار الحصول على كل المحتويات (للإحصائيات)
  app.get(`${apiPrefix}/contents`, async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch contents', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/:id`, async (req, res) => {
    try {
      const content = await storage.getContentById(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/type/:contentType`, async (req, res) => {
    try {
      const contentType = req.params.contentType;
      const content = await storage.getContentByType(contentType);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content by type', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/department/:department`, async (req, res) => {
    try {
      const department = req.params.department;
      const content = await storage.getContentByDepartment(department);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content by department', error: (error as Error).message });
    }
  });

  // Authentication bridge endpoints (used to connect to Firebase Auth)
  app.post(`${apiPrefix}/auth/verify-token`, async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    // In a real implementation, you would verify the Firebase token
    // Here we just acknowledge the request as this is handled client-side
    res.json({ message: 'Token verification handled client-side with Firebase' });
  });
  
  // مسارات رفع وتنزيل الملفات
  
  // مسار لرفع ملف جديد
  app.post(`${apiPrefix}/upload`, upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم تقديم أي ملف' });
      }
      
      const file = req.file;
      const contentType = req.body.contentType;
      
      // استعادة عنوان URL للملف المرفوع (يتم استخدامه للتنزيل لاحقًا)
      const fileUrl = `/api/download/${contentType}/${file.filename}`;
      
      return res.status(200).json({
        message: 'تم رفع الملف بنجاح',
        file: {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
        fileUrl: fileUrl,
      });
    } catch (error) {
      console.error('خطأ في معالجة رفع الملف:', error);
      return res.status(500).json({ error: 'فشل في رفع الملف' });
    }
  }, handleUploadErrors);
  
  // مسار لتنزيل ملف
  app.get(`${apiPrefix}/download/:contentType/:filename`, (req: Request, res: Response) => {
    try {
      const { contentType, filename } = req.params;
      
      // الحصول على المسار الكامل للملف
      const filePath = getFilePath(contentType, filename);
      
      // التحقق من وجود الملف
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'الملف غير موجود' });
      }
      
      // إرسال الملف
      return res.download(filePath);
    } catch (error) {
      console.error('خطأ في تنزيل الملف:', error);
      return res.status(500).json({ error: 'فشل في تنزيل الملف' });
    }
  });
  
  // مسار لحذف ملف
  app.delete(`${apiPrefix}/files/:contentType/:filename`, (req: Request, res: Response) => {
    try {
      const { contentType, filename } = req.params;
      
      // الحصول على المسار الكامل للملف
      const filePath = getFilePath(contentType, filename);
      
      // محاولة حذف الملف
      const deleted = deleteFile(filePath);
      
      if (deleted) {
        return res.status(200).json({ message: 'تم حذف الملف بنجاح' });
      } else {
        return res.status(404).json({ error: 'الملف غير موجود أو لا يمكن حذفه' });
      }
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      return res.status(500).json({ error: 'فشل في حذف الملف' });
    }
  });

  // ===================== مسارات المحتوى الجديدة =======================
  
  // ==================== مسارات خاصة بالمقالات النصية ====================
  
  // حفظ مقال نصي جديد
  app.post(`${apiPrefix}/articles/text`, async (req, res) => {
    try {
      const { id, title, content } = req.body;
      if (!id || !title || !content) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
      }

      const fileName = await saveArticleText(id, title, content);
      res.json({ fileName });
    } catch (error) {
      console.error('Error saving article:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء حفظ المقال' });
    }
  });
  
  // قراءة محتوى مقال نصي
  app.get(`${apiPrefix}/articles/text/:fileName`, async (req, res) => {
    try {
      let { fileName } = req.params;
      
      // Ensure proper file extension
      if (fileName.endsWith('.txt')) {
        fileName = fileName.replace('.txt', '.html');
      } else if (!fileName.includes('.')) {
        fileName = `${fileName}.html`;
      }

      const content = await readArticleText(fileName);
      
      // Set proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Send the content
      res.send(content);
    } catch (error) {
      console.error('Error reading article:', error);
      res.status(404).json({ error: 'المقال غير موجود' });
    }
  });
  
  // تحويل مقال نصي إلى PDF (HTML في الوقت الحالي)
  app.get(`${apiPrefix}/articles/pdf/:id/:title`, async (req: Request, res: Response) => {
    try {
      const { id, title } = req.params;
      
      if (!id || !title) {
        return res.status(400).json({ error: 'معرف المقال والعنوان مطلوبان' });
      }
      
      // تحويل المقال إلى PDF (HTML حاليًا)
      const htmlFilePath = await convertArticleToPdf(id, title);
      
      // إرسال الملف كاستجابة
      return res.download(htmlFilePath);
    } catch (error) {
      console.error('خطأ في تحويل المقال إلى PDF:', error);
      return res.status(500).json({ error: 'فشل في تحويل المقال إلى PDF', details: (error as Error).message });
    }
  });
  
  // ==================== مسارات لإدارة المحتوى الجديدة ====================
  
  // إضافة محتوى جديد
  app.post(`${apiPrefix}/content`, async (req: Request, res: Response) => {
    try {
      const contentData = req.body;
      
      if (!contentData.title || !contentData.description || !contentData.contentType || !contentData.authorName) {
        return res.status(400).json({ error: 'بعض الحقول المطلوبة غير متوفرة' });
      }
      
      // إذا كان المحتوى مقالاً نصياً وتم تقديم نص المقال
      if (contentData.contentType === 'article' && contentData.articleText) {
        // حفظ نص المقال كملف
        const articleId = Date.now().toString();
        const fileName = await saveArticleText(articleId, contentData.title, contentData.articleText);
        
        // إضافة مسار الملف إلى بيانات المحتوى
        contentData.articleTextPath = fileName;
      }
      
      const newContent = await storage.createContent(contentData);
      
      return res.status(201).json(newContent);
    } catch (error) {
      console.error('خطأ في إضافة المحتوى:', error);
      return res.status(500).json({ error: 'فشل في إضافة المحتوى', details: (error as Error).message });
    }
  });
  
  // تحديث محتوى موجود
  app.put(`${apiPrefix}/content/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contentData = req.body;
      
      // إذا كان المحتوى مقالاً نصياً وتم تقديم نص المقال
      if (contentData.contentType === 'article' && contentData.articleText) {
        // الحصول على المحتوى الحالي
        const existingContent = await storage.getContentById(id);
        
        // إذا كان هناك مسار ملف مقال موجود، فقم بتحديثه، أو أنشئ ملفاً جديداً
        const articleId = existingContent?.articleTextPath?.split('_')[0] || Date.now().toString();
        const fileName = await saveArticleText(articleId, contentData.title || existingContent?.title || 'Untitled', contentData.articleText);
        
        // إضافة مسار الملف إلى بيانات المحتوى
        contentData.articleTextPath = fileName;
      }
      
      const updatedContent = await storage.updateContent(id, contentData);
      
      if (!updatedContent) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      return res.status(200).json(updatedContent);
    } catch (error) {
      console.error('خطأ في تحديث المحتوى:', error);
      return res.status(500).json({ error: 'فشل في تحديث المحتوى', details: (error as Error).message });
    }
  });
  
  // حذف محتوى
  app.delete(`${apiPrefix}/content/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // الحصول على المحتوى قبل حذفه للتحقق من الملفات المرتبطة
      const content = await storage.getContentById(id);
      if (!content) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      // حذف ملف المقال النصي إذا كان موجودًا
      if (content.articleTextPath) {
        try {
          const filePath = path.join('./content/articles', content.articleTextPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn('خطأ في حذف ملف المقال:', fileError);
          // استمر في عملية الحذف حتى لو فشل حذف الملف
        }
      }
      
      // حذف الملف المرفق إذا كان موجودًا
      if (content.fileUrl) {
        try {
          const fileUrlParts = content.fileUrl.split('/');
          const fileName = fileUrlParts[fileUrlParts.length - 1];
          const contentType = fileUrlParts[fileUrlParts.length - 2];
          const filePath = getFilePath(contentType, fileName);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn('خطأ في حذف الملف المرفق:', fileError);
          // استمر في عملية الحذف حتى لو فشل حذف الملف
        }
      }
      
      const deleted = await storage.deleteContent(id);
      
      return res.status(200).json({ message: 'تم حذف المحتوى بنجاح' });
    } catch (error) {
      console.error('خطأ في حذف المحتوى:', error);
      return res.status(500).json({ error: 'فشل في حذف المحتوى', details: (error as Error).message });
    }
  });
  
  // الحصول على كل المحتويات
  app.get(`${apiPrefix}/contents`, async (req: Request, res: Response) => {
    try {
      const contents = await storage.getAllContent();
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات', details: (error as Error).message });
    }
  });
  
  // الحصول على محتوى محدد بالمعرف
  app.get(`${apiPrefix}/contents/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const content = await storage.getContentById(id);
      
      if (!content) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      return res.status(200).json(content);
    } catch (error) {
      console.error('خطأ في جلب المحتوى:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتوى', details: (error as Error).message });
    }
  });
  
  // الحصول على المحتويات حسب النوع
  app.get(`${apiPrefix}/contents/type/:contentType`, async (req: Request, res: Response) => {
    try {
      const contentType = req.params.contentType;
      
      const contents = await storage.getContentByType(contentType);
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات حسب النوع:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات حسب النوع', details: (error as Error).message });
    }
  });
  
  // الحصول على المحتويات حسب القسم
  app.get(`${apiPrefix}/contents/department/:department`, async (req: Request, res: Response) => {
    try {
      const department = req.params.department;
      
      const contents = await storage.getContentByDepartment(department);
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات حسب القسم:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات حسب القسم', details: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
