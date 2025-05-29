import fs from 'fs';
import path from 'path';
import { ContentType, type Content, type InsertContent, type ContentTypeType, type DepartmentType } from '@shared/schema';

// مسارات المجلدات
const contentDir = path.join('.', 'content');
const articlesDir = path.join(contentDir, 'articles');
const ebooksDir = path.join(contentDir, 'ebooks');
const projectsDir = path.join(contentDir, 'projects');

// التأكد من وجود المجلدات
export function ensureContentDirectories() {
  [contentDir, articlesDir, ebooksDir, projectsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// دالة لتحديد مسار المجلد حسب نوع المحتوى
function getDirectoryForContentType(contentType: string): string {
  switch (contentType) {
    case ContentType.ARTICLE:
      return articlesDir;
    case ContentType.EBOOK:
      return ebooksDir;
    case ContentType.PROJECT:
      return projectsDir;
    default:
      return contentDir;
  }
}

// دالة لحفظ محتوى المقال كملف نصي
export async function saveArticleText(id: string, title: string, content: string): Promise<string> {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const fileName = `${id}_${sanitizedTitle}.html`;
  const filePath = path.join(articlesDir, fileName);
  
  // Ensure the content is wrapped in proper HTML structure if it's not already
  const htmlContent = content.startsWith('<!DOCTYPE html>') ? content : `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            direction: rtl;
            text-align: right;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;
  
  // Delete old .txt file if it exists
  const oldTxtPath = filePath.replace('.html', '.txt');
  if (fs.existsSync(oldTxtPath)) {
    fs.unlinkSync(oldTxtPath);
  }
  
  fs.writeFileSync(filePath, htmlContent, 'utf8');
  
  return fileName;
}

// دالة لقراءة محتوى المقال من الملف
export async function readArticleText(fileName: string): Promise<string> {
  // Try both .html and .txt extensions
  const htmlFileName = fileName.replace('.txt', '.html');
  const htmlPath = path.join(articlesDir, htmlFileName);
  const txtPath = path.join(articlesDir, fileName);
  
  // First try .html
  if (fs.existsSync(htmlPath)) {
    return fs.readFileSync(htmlPath, 'utf8');
  }
  
  // Then try .txt
  if (fs.existsSync(txtPath)) {
    let content = fs.readFileSync(txtPath, 'utf8');
    
    // Try to parse JSON content
    try {
      const jsonContent = JSON.parse(content);
      if (jsonContent.content) {
        content = jsonContent.content;
      }
    } catch (e) {
      // If not JSON, use the content as is
      console.log('Content is not in JSON format, using as is');
    }
    
    // Format the content with proper HTML structure
    const formattedContent = content
      .split('\n\n')
      .map(paragraph => {
        // Check if paragraph starts with emoji and title
        if (paragraph.match(/^[^\w]*[🌱✅⚠️🌍🧠]/)) {
          const [emoji, ...rest] = paragraph.split(' ');
          const title = rest.join(' ');
          return `<div class="section">
            <h2>${emoji} ${title}</h2>
          </div>`;
        }
        // Check if paragraph is a list item
        else if (paragraph.includes(':')) {
          const [title, ...items] = paragraph.split('\n');
          const formattedItems = items
            .filter(item => item.trim())
            .map(item => `<li>${item.trim()}</li>`)
            .join('');
          return `<div class="section">
            <h3>${title}</h3>
            <ul>${formattedItems}</ul>
          </div>`;
        }
        // Regular paragraph
        else {
          return `<p>${paragraph}</p>`;
        }
      })
      .join('');
    
    // Create a beautiful HTML wrapper for the content
    const beautifulHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.txt', '')}</title>
    <style>
        :root {
            --primary-color: #2e7d32;
            --secondary-color: #4caf50;
            --text-color: #333;
            --bg-color: #f8f9fa;
            --card-bg: #ffffff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Segoe UI', sans-serif;
            line-height: 1.8;
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 0;
            margin: 0;
            direction: rtl;
        }

        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        .article-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .article-title {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .article-meta {
            color: #666;
            font-size: 0.9rem;
        }

        .article-content {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .section {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .section h2 {
            color: var(--primary-color);
            font-size: 1.8rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section h3 {
            color: var(--secondary-color);
            font-size: 1.4rem;
            margin-bottom: 1rem;
        }

        p {
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
            line-height: 1.8;
            text-align: justify;
        }

        ul {
            list-style-type: none;
            padding-right: 1.5rem;
            margin-bottom: 1.5rem;
        }

        ul li {
            margin-bottom: 0.8rem;
            position: relative;
            padding-right: 1.5rem;
            font-size: 1.1rem;
            line-height: 1.6;
        }

        ul li:before {
            content: "•";
            color: var(--secondary-color);
            position: absolute;
            right: 0;
            font-size: 1.2rem;
        }

        @media (max-width: 768px) {
            .article-container {
                padding: 1rem;
            }

            .article-title {
                font-size: 2rem;
            }

            .article-content {
                padding: 1.5rem;
            }

            .section {
                padding: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="article-container">
        <header class="article-header">
            <h1 class="article-title">${fileName.replace('.txt', '')}</h1>
            <div class="article-meta">
                ${new Date().toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
        </header>
        <main class="article-content">
            ${formattedContent}
        </main>
    </div>
</body>
</html>`;
    
    // Save the HTML content to a new file
    const newHtmlPath = path.join(articlesDir, htmlFileName);
    fs.writeFileSync(newHtmlPath, beautifulHtml, 'utf8');
    
    return beautifulHtml;
  }
  
  throw new Error('ملف المقال غير موجود');
}

// دالة لتخزين بيانات المحتوى في ملف JSON
export async function saveContentMetadata(contents: Content[]): Promise<void> {
  const filePath = path.join(contentDir, 'metadata.json');
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 2), 'utf8');
}

// دالة لقراءة بيانات المحتوى من ملف JSON
export async function readContentMetadata(): Promise<Content[]> {
  const filePath = path.join(contentDir, 'metadata.json');
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// دالة لإضافة محتوى جديد
export async function addContent(content: InsertContent): Promise<Content> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // إنشاء معرف فريد
  const id = Date.now().toString();
  
  // إنشاء كائن المحتوى الجديد
  const newContent: Content = {
    id: parseInt(id),
    title: content.title,
    description: content.description,
    contentType: content.contentType as ContentTypeType,
    department: content.department as DepartmentType || null,
    authorName: content.authorName,
    fileUrl: content.fileUrl || null,
    articleTextPath: content.articleTextPath || null,
    externalLink: content.externalLink || null,
    authorId: content.authorId || null,
    studentYear: content.studentYear || null,
    thumbnailUrl: content.thumbnailUrl || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // إضافة المحتوى الجديد إلى المصفوفة
  contents.push(newContent);
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return newContent;
}

// دالة لتحديث محتوى موجود
export async function updateContent(id: number, content: Partial<InsertContent>): Promise<Content | null> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // البحث عن المحتوى المطلوب تعديله
  const index = contents.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // تحديث المحتوى
  const oldContent = contents[index];
  
  // ضمان أن أنواع البيانات صحيحة
  const currentContentType = oldContent.contentType as ContentTypeType;
  const currentDepartment = oldContent.department as DepartmentType;
  
  const updatedContent: Content = {
    id: oldContent.id,
    title: content.title || oldContent.title,
    description: content.description || oldContent.description,
    contentType: (content.contentType as ContentTypeType) || oldContent.contentType,
    department: (content.department as DepartmentType) || oldContent.department,
    authorName: content.authorName || oldContent.authorName,
    fileUrl: content.fileUrl !== undefined ? content.fileUrl : oldContent.fileUrl,
    articleTextPath: content.articleTextPath !== undefined ? content.articleTextPath : oldContent.articleTextPath,
    externalLink: content.externalLink !== undefined ? content.externalLink : oldContent.externalLink,
    authorId: content.authorId !== undefined ? content.authorId : oldContent.authorId,
    studentYear: content.studentYear !== undefined ? content.studentYear : oldContent.studentYear,
    thumbnailUrl: content.thumbnailUrl !== undefined ? content.thumbnailUrl : oldContent.thumbnailUrl,
    createdAt: oldContent.createdAt,
    updatedAt: new Date()
  };
  
  // تحديث المصفوفة
  contents[index] = updatedContent;
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return updatedContent;
}

// دالة لحذف محتوى
export async function deleteContent(id: number): Promise<boolean> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // البحث عن المحتوى المطلوب حذفه
  const index = contents.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // حذف أي ملفات مرتبطة
  const content = contents[index];
  
  if (content.fileUrl) {
    const urlParts = content.fileUrl.split('/');
    if (urlParts.length >= 3) {
      const filename = urlParts[urlParts.length - 1];
      const contentType = urlParts[urlParts.length - 2];
      const filePath = path.join(getDirectoryForContentType(contentType), filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
  
  // حذف المحتوى من المصفوفة
  contents.splice(index, 1);
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return true;
}

// دالة للحصول على كل المحتويات
export async function getAllContent(): Promise<Content[]> {
  return readContentMetadata();
}

// دالة للحصول على محتوى محدد بالمعرف
export async function getContentById(id: number): Promise<Content | null> {
  const contents = await readContentMetadata();
  const content = contents.find(item => item.id === id);
  return content || null;
}

// دالة للحصول على المحتويات حسب النوع
export async function getContentByType(contentType: string): Promise<Content[]> {
  const contents = await readContentMetadata();
  return contents.filter(item => item.contentType === contentType);
}

// دالة للحصول على المحتويات حسب القسم
export async function getContentByDepartment(department: string): Promise<Content[]> {
  const contents = await readContentMetadata();
  return contents.filter(item => item.department === department);
}

// دالة لتحويل المقال النصي إلى PDF
export async function convertArticleToPdf(articleId: string, articleTitle: string): Promise<string> {
  // نقرأ محتوى المقال
  const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const htmlFileName = `${articleId}_${sanitizedTitle}.html`;
  const articleContent = await readArticleText(htmlFileName);
  
  // نقوم بإنشاء ملف HTML وسيط (يمكن استخدام مكتبات مثل html-pdf أو puppeteer لتحويل HTML إلى PDF)
  const htmlContent = `
  <!DOCTYPE html>
  <html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>${articleTitle}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 20px;
        direction: rtl;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      .content {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <h1>${articleTitle}</h1>
    <div class="content">${articleContent}</div>
  </body>
  </html>
  `;
  
  const htmlFilePath = path.join(articlesDir, `${articleId}_${sanitizedTitle}.html`);
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  
  return htmlFilePath;
}