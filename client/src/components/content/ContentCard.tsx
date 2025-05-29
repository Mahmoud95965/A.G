import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentType } from "@shared/schema";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { ExternalLink, Download, FileText, File } from "lucide-react";

interface ContentCardProps {
  content: {
    id: string | number;
    title: string;
    description: string;
    contentType: ContentTypeType;
    authorName: string;
    studentYear?: string;
    fileUrl?: string;
    externalLink?: string;
    thumbnailUrl?: string;
    createdAt: string | { toDate: () => Date };
    department?: string;
  };
}

type ContentTypeType = typeof ContentType[keyof typeof ContentType];

const departmentNames: Record<string, string> = {
  "horticulture": "البساتين",
  "crops": "المحاصيل",
  "soil": "الأراضي والمياه",
  "protection": "وقاية النبات",
  "other": "أخرى"
};

const contentTypeDetails: Record<string, { label: string, color: string }> = {
  [ContentType.ARTICLE]: { label: "مقال علمي", color: "primary" },
  [ContentType.EBOOK]: { label: "كتاب إلكتروني", color: "secondary" },
  [ContentType.PROJECT]: { label: "مشروع تخرج", color: "accent" }
};

export default function ContentCard({ content }: ContentCardProps) {
  // Format date to Arabic
  const formattedDate = format(
    typeof content.createdAt === 'string'
      ? new Date(content.createdAt)
      : content.createdAt && typeof content.createdAt === 'object' && 'toDate' in content.createdAt
        ? content.createdAt.toDate()
        : new Date(),
    "d MMMM yyyy",
    { locale: arEG }
  );

  const getContentLink = () => {
    switch (content.contentType) {
      case ContentType.ARTICLE:
        return `/articles/${content.id}`;
      case ContentType.EBOOK:
        return `/ebooks/${content.id}`;
      case ContentType.PROJECT:
        return `/projects/${content.id}`;
      default:
        return "#";
    }
  };

  const getActionText = () => {
    switch (content.contentType) {
      case ContentType.ARTICLE:
        return "قراءة المزيد";
      case ContentType.EBOOK:
        return "تحميل الكتاب";
      case ContentType.PROJECT:
        return "عرض المشروع";
      default:
        return "عرض التفاصيل";
    }
  };

  const renderActionButton = () => {
    // إذا كان هناك رابط خارجي
    if (content.externalLink) {
      return (
        <a 
          href={content.externalLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors"
        >
          {getActionText()}
          <ExternalLink className="ml-1 w-4 h-4" />
        </a>
      );
    } 
    // إذا كان هناك ملف وكان المحتوى من نوع مقال
    else if (content.fileUrl && content.contentType === ContentType.ARTICLE) {
      // تحقق مما إذا كان رابط الملف يشير إلى مقال نصي
      const isTextArticle = content.fileUrl.includes('/api/articles/text/');
      
      return (
        <div className="flex items-center space-x-reverse space-x-4">
          <a 
            href={content.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors"
          >
            {getActionText()}
            <FileText className="ml-1 w-4 h-4" />
          </a>
          
          {isTextArticle && (
            <a 
              href={content.fileUrl.replace('/text/', '/pdf/')
                  .replace(/\.txt$/, '.pdf')} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors"
            >
              تنزيل PDF
              <File className="ml-1 w-4 h-4" />
            </a>
          )}
        </div>
      );
    }
    // إذا كان هناك ملف ولم يكن المحتوى من نوع مقال
    else if (content.fileUrl) {
      return (
        <a 
          href={content.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors"
        >
          {getActionText()}
          <Download className="ml-1 w-4 h-4" />
        </a>
      );
    } 
    // إذا لم يكن هناك ملف أو رابط خارجي
    else {
      return (
        <Link href={getContentLink()}>
          <span className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors cursor-pointer">
            {getActionText()}
            <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </Link>
      );
    }
  };

  let authorInfo = content.authorName;
  if (content.contentType === ContentType.PROJECT && content.studentYear) {
    authorInfo = `${content.authorName} - ${content.studentYear}`;
  }

  const typeInfo = contentTypeDetails[content.contentType] || { label: "محتوى", color: "neutral" };
  
  return (
    <Card className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={content.thumbnailUrl || `https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=225&q=80`} 
          className="w-full h-full object-cover" 
          alt={content.title}
        />
        {content.department && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white bg-opacity-80">
              {departmentNames[content.department] || content.department}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-3">
          <Badge variant="secondary" className={`text-${typeInfo.color}-dark bg-${typeInfo.color}-light bg-opacity-20 px-3 py-1 rounded-full`}>
            {typeInfo.label}
          </Badge>
          <span className="text-sm text-neutral-500">
            {formattedDate}
          </span>
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">{content.title}</h3>
        <p className="text-neutral-600 mb-4 line-clamp-2">{content.description}</p>
        <div className="flex justify-between items-center">
          {renderActionButton()}
          <span className="text-sm text-neutral-500">{authorInfo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
