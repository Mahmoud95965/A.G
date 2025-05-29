import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ContentType } from '@shared/schema';

// إنشاء المجلدات اللازمة للتخزين إذا لم تكن موجودة
const uploadDir = path.join('.', 'uploads');
const articleDir = path.join(uploadDir, 'articles');
const ebookDir = path.join(uploadDir, 'ebooks');
const projectDir = path.join(uploadDir, 'projects');

// التأكد من وجود جميع المجلدات
[uploadDir, articleDir, ebookDir, projectDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// إعداد تكوين multer لكل نوع محتوى
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // استخراج نوع المحتوى من طلب العميل
    const contentType = req.body.contentType;
    
    // تحديد المجلد المناسب حسب نوع المحتوى
    let destinationFolder = uploadDir;
    
    switch (contentType) {
      case ContentType.ARTICLE:
        destinationFolder = articleDir;
        break;
      case ContentType.EBOOK:
        destinationFolder = ebookDir;
        break;
      case ContentType.PROJECT:
        destinationFolder = projectDir;
        break;
    }
    
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف باستخدام الوقت الحالي واسم الملف الأصلي
    const uniqueFileName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueFileName);
  }
});

// إنشاء middleware مع القيود
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // الحد الأقصى لحجم الملف (30 ميجا بايت)
  },
  fileFilter: (req, file, cb) => {
    // قائمة الامتدادات المسموح بها
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP, RAR'));
    }
  }
});

// دالة لحذف ملف
export const deleteFile = (filePath: string): boolean => {
  try {
    // التحقق من وجود الملف قبل محاولة حذفه
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    return false;
  }
};

// دالة للحصول على مسار الملف الكامل
export const getFilePath = (contentType: string, fileName: string): string => {
  let folderName = '';
  
  switch (contentType) {
    case ContentType.ARTICLE:
      folderName = 'articles';
      break;
    case ContentType.EBOOK:
      folderName = 'ebooks';
      break;
    case ContentType.PROJECT:
      folderName = 'projects';
      break;
    default:
      folderName = '';
  }
  
  return path.join(uploadDir, folderName, fileName);
};

// middleware لمعالجة أخطاء رفع الملفات
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف أكبر من المسموح به (30 ميجا بايت)' });
    }
    return res.status(400).json({ error: `خطأ في رفع الملف: ${err.message}` });
  }
  
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  
  next();
};