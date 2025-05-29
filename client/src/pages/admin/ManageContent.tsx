import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  File, 
  Users, 
  Pencil, 
  Trash2, 
  Search, 
  PlusCircle, 
  FileText, 
  BookOpen, 
  GraduationCap,
  LayoutDashboard,
  Upload
} from "lucide-react";
import { 
  addContent, 
  updateContent, 
  deleteContent, 
  getContentByType,
  db, 
  storage 
} from "@/lib/firebase";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ContentType, ContentTypeType, Department, InsertContent } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

// Content form schema
const contentFormSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  contentType: z.enum([ContentType.ARTICLE, ContentType.EBOOK, ContentType.PROJECT]),
  department: z.string().optional(),
  authorName: z.string().min(2, "اسم المؤلف مطلوب"),
  studentYear: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
  articleText: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

const contentTypeLabels: Record<string, string> = {
  [ContentType.ARTICLE]: "مقال علمي",
  [ContentType.EBOOK]: "كتاب إلكتروني",
  [ContentType.PROJECT]: "مشروع تخرج",
};

const departmentLabels: Record<string, string> = {
  [Department.HORTICULTURE]: "البساتين",
  [Department.CROPS]: "المحاصيل",
  [Department.SOIL]: "الأراضي والمياه",
  [Department.PROTECTION]: "وقاية النبات",
  [Department.OTHER]: "أخرى",
};

export default function ManageContent() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [contentList, setContentList] = useState<DocumentData[]>([]);
  const [filteredContent, setFilteredContent] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<DocumentData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Get URL params for initial state
  const queryParams = new URLSearchParams(window.location.search);
  const typeParam = queryParams.get("type");
  const actionParam = queryParams.get("action");

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "غير مصرح بالوصول",
        description: "هذه الصفحة متاحة فقط للمسؤولين",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, navigate, toast]);

  useEffect(() => {
    // Check if we should open the add form based on URL params
    if (actionParam === "new") {
      setIsAddMode(true);
      if (typeParam && (typeParam === ContentType.ARTICLE || typeParam === ContentType.EBOOK || typeParam === ContentType.PROJECT)) {
        form.setValue("contentType", typeParam as any);
      }
    }
  }, [actionParam, typeParam]);

  // Initialize content form
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: ContentType.ARTICLE,
      department: "",
      authorName: "",
      studentYear: "",
      externalLink: "",
    },
  });

  // Load content list
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        
        // استخدام واجهة API للخادم بدلاً من Firebase
        const response = await fetch('/api/contents');
        
        if (!response.ok) {
          throw new Error('فشل في جلب المحتوى');
        }
        
        const contents = await response.json();
        
        setContentList(contents);
        setFilteredContent(contents);
        
        // تحديث حالة التحميل للمزيد من المحتوى
        if (contents.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
          // استخدم معرف آخر عنصر كنقطة بداية للتحميل التالي
          if (contents.length > 0) {
            setLastVisible(contents[contents.length - 1].id);
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل قائمة المحتوى",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchContent();
    }
  }, [isAdmin, toast]);

  // Filter content based on tab and search query
  useEffect(() => {
    if (activeTab === "all") {
      if (searchQuery) {
        const filtered = contentList.filter(
          content => 
            content.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            content.authorName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredContent(filtered);
      } else {
        setFilteredContent(contentList);
      }
    } else {
      let filtered = contentList.filter(content => content.contentType === activeTab);
      
      if (searchQuery) {
        filtered = filtered.filter(
          content => 
            content.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            content.authorName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredContent(filtered);
    }
  }, [activeTab, searchQuery, contentList]);

  const loadMore = async () => {
    if (!lastVisible) return;
    
    try {
      setIsLoading(true);
      
      // استخدام واجهة API للخادم لتحميل المزيد من المحتوى
      const response = await fetch(`/api/contents?after=${lastVisible}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب المزيد من المحتوى');
      }
      
      const newContents = await response.json();
      
      if (newContents.length === 0) {
        setHasMore(false);
      } else {
        setContentList([...contentList, ...newContents]);
        // استخدم معرف آخر عنصر جديد كنقطة بداية للتحميل التالي
        if (newContents.length > 0) {
          setLastVisible(newContents[newContents.length - 1].id);
        }
      }
    } catch (error) {
      console.error("Error loading more content:", error);
      toast({
        title: "خطأ في تحميل المزيد",
        description: "حدث خطأ أثناء تحميل المزيد من المحتوى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = async (values: ContentFormValues) => {
    try {
      setIsSubmitting(true);
      
      let fileUrl = "";
      let thumbnailUrl = "";
      
      // إذا كان المحتوى من نوع مقال ولديه نص مقال، نقوم بحفظ المقال النصي
      if (values.contentType === ContentType.ARTICLE && values.articleText) {
        try {
          // إنشاء معرف فريد للمقال
          const articleId = `article_${Date.now()}`;
          
          // حفظ نص المقال
          const response = await fetch('/api/articles/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: articleId,
              title: values.title,
              content: values.articleText,
            }),
          });
          
          if (!response.ok) {
            throw new Error('فشل في حفظ نص المقال');
          }
          
          const data = await response.json();
          fileUrl = data.fileUrl;
        } catch (articleError) {
          console.error('خطأ في حفظ نص المقال:', articleError);
          throw articleError;
        }
      } 
      // تحميل الملف إلى الخادم إذا تم تقديمه (إذا كان هناك ملف PDF بالإضافة إلى المقال النصي أو كان نوع آخر من المحتوى)
      else if (contentFile) {
        try {
          // إنشاء نموذج بيانات لإرسال الملف
          const formData = new FormData();
          formData.append('file', contentFile);
          formData.append('contentType', values.contentType);
          formData.append('title', values.title);
          
          // إرسال الملف إلى الخادم
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('فشل في رفع الملف');
          }
          
          const data = await response.json();
          fileUrl = data.fileUrl;
        } catch (uploadError) {
          console.error('خطأ في رفع الملف:', uploadError);
          throw uploadError;
        }
      }
      
      // تحميل الصورة المصغرة إذا تم تقديمها (لا زلنا نستخدم Firebase Storage للصور المصغرة)
      if (thumbnailFile) {
        const thumbnailRef = ref(storage, `thumbnails/${values.contentType}/${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbnailRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }
      
      // Prepare content data
      const contentData: InsertContent = {
        title: values.title,
        description: values.description,
        contentType: values.contentType,
        department: values.department || undefined,
        authorName: values.authorName,
        fileUrl: fileUrl || undefined,
        externalLink: values.externalLink || undefined,
        studentYear: values.studentYear || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      };
      
      // Add content to database
      await addContent(contentData);
      
      toast({
        title: "تم إضافة المحتوى بنجاح",
        description: "تمت إضافة المحتوى الجديد إلى قاعدة البيانات",
      });
      
      // Reset form and state
      form.reset();
      setContentFile(null);
      setThumbnailFile(null);
      setIsAddMode(false);
      
      // Refresh content list
      const response = await fetch('/api/contents');
      
      if (!response.ok) {
        throw new Error('فشل في جلب المحتوى');
      }
      
      const contents = await response.json();
      
      setContentList(contents);
      setFilteredContent(contents);
      
      // تحديث حالة التحميل للمزيد من المحتوى
      if (contents.length > 0) {
        setLastVisible(contents[contents.length - 1].id);
        setHasMore(contents.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error adding content:", error);
      toast({
        title: "خطأ في إضافة المحتوى",
        description: "حدث خطأ أثناء إضافة المحتوى الجديد",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditContent = async (values: ContentFormValues) => {
    if (!selectedContent) return;
    
    try {
      setIsSubmitting(true);
      
      let fileUrl = selectedContent.fileUrl || "";
      let thumbnailUrl = selectedContent.thumbnailUrl || "";
      
      // إذا كان المحتوى من نوع مقال وتم تعديل نص المقال
      if (values.contentType === ContentType.ARTICLE && values.articleText) {
        try {
          // إذا كان المقال موجودًا بالفعل (نستخرج معرف المقال من رابط الملف)
          let articleId = "";
          
          if (fileUrl && fileUrl.includes('/api/articles/')) {
            // استخراج الجزء الخاص بالمعرف من الرابط
            const urlParts = fileUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            articleId = fileName.split('_')[0]; // نفترض أن المعرف هو الجزء الأول قبل الشرطة السفلية
          } else {
            // إنشاء معرف جديد إذا لم يكن هناك مقال موجود مسبقًا
            articleId = `article_${Date.now()}`;
          }
          
          // حفظ النص المعدل للمقال
          const response = await fetch('/api/articles/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: articleId,
              title: values.title,
              content: values.articleText,
            }),
          });
          
          if (!response.ok) {
            throw new Error('فشل في حفظ نص المقال');
          }
          
          const data = await response.json();
          fileUrl = data.fileUrl;
        } catch (articleError) {
          console.error('خطأ في حفظ نص المقال:', articleError);
          throw articleError;
        }
      } 
      // تحميل الملف الجديد إلى الخادم إذا تم تقديمه
      else if (contentFile) {
        try {
          // إنشاء نموذج بيانات لإرسال الملف
          const formData = new FormData();
          formData.append('file', contentFile);
          formData.append('contentType', values.contentType);
          formData.append('title', values.title);
          
          // إرسال الملف إلى الخادم
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('فشل في رفع الملف');
          }
          
          const data = await response.json();
          fileUrl = data.fileUrl;
        } catch (uploadError) {
          console.error('خطأ في رفع الملف:', uploadError);
          throw uploadError;
        }
      }
      
      // تحميل الصورة المصغرة الجديدة إذا تم تقديمها (لا زلنا نستخدم Firebase Storage للصور المصغرة)
      if (thumbnailFile) {
        const thumbnailRef = ref(storage, `thumbnails/${values.contentType}/${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbnailRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }
      
      // Prepare updated content data
      const contentData: Partial<InsertContent> = {
        title: values.title,
        description: values.description,
        contentType: values.contentType,
        department: values.department || undefined,
        authorName: values.authorName,
        externalLink: values.externalLink || undefined,
        studentYear: values.studentYear || undefined,
      };
      
      // Only update URLs if files were uploaded
      if (contentFile) contentData.fileUrl = fileUrl;
      if (thumbnailFile) contentData.thumbnailUrl = thumbnailUrl;
      
      // Update content in database
      await updateContent(selectedContent.id, contentData);
      
      toast({
        title: "تم تحديث المحتوى بنجاح",
        description: "تم تحديث المحتوى في قاعدة البيانات",
      });
      
      // Reset form and state
      form.reset();
      setContentFile(null);
      setThumbnailFile(null);
      setIsEditMode(false);
      setSelectedContent(null);
      
      // Refresh content list
      const updatedList = contentList.map(item => {
        if (item.id === selectedContent.id) {
          return { ...item, ...contentData };
        }
        return item;
      });
      
      setContentList(updatedList);
      setFilteredContent(updatedList);
    } catch (error) {
      console.error("Error updating content:", error);
      toast({
        title: "خطأ في تحديث المحتوى",
        description: "حدث خطأ أثناء تحديث المحتوى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedContent) return;
    
    try {
      // استخدام واجهة API للخادم لحذف المحتوى
      const response = await fetch(`/api/content/${selectedContent.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف المحتوى');
      }
      
      toast({
        title: "تم حذف المحتوى بنجاح",
        description: "تم حذف المحتوى من قاعدة البيانات",
      });
      
      // Remove from state
      const updatedList = contentList.filter(item => item.id !== selectedContent.id);
      setContentList(updatedList);
      setFilteredContent(updatedList);
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "خطأ في حذف المحتوى",
        description: "حدث خطأ أثناء حذف المحتوى",
        variant: "destructive",
      });
    }
  };

  const editContent = async (content: DocumentData) => {
    setSelectedContent(content);
    
    // تعبئة النموذج بالبيانات الأساسية
    form.setValue("title", content.title);
    form.setValue("description", content.description);
    form.setValue("contentType", content.contentType);
    form.setValue("department", content.department || "");
    form.setValue("authorName", content.authorName);
    form.setValue("studentYear", content.studentYear || "");
    form.setValue("externalLink", content.externalLink || "");
    
    // إذا كان المحتوى من نوع مقال وله رابط ملف يشير إلى مقال نصي، نقوم بتحميل نص المقال
    if (content.contentType === ContentType.ARTICLE && content.fileUrl && content.fileUrl.includes('/api/articles/text/')) {
      try {
        // استخراج اسم الملف من الرابط
        const urlParts = content.fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // جلب محتوى المقال
        const response = await fetch(`/api/articles/text/${fileName}`);
        
        if (response.ok) {
          const data = await response.json();
          form.setValue("articleText", data.content);
          
          // تنبيه المستخدم
          toast({
            title: "تم تحميل نص المقال",
            description: "يمكنك الآن تحرير نص المقال",
          });
        } else {
          console.error('فشل في تحميل نص المقال');
          toast({
            title: "تنبيه",
            description: "لم نتمكن من تحميل نص المقال، يمكنك إدخال نص جديد",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('خطأ في تحميل نص المقال:', error);
      }
    }
    
    setIsEditMode(true);
  };

  const confirmDelete = (content: DocumentData) => {
    setSelectedContent(content);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    form.reset();
    setContentFile(null);
    setThumbnailFile(null);
    setIsAddMode(false);
    setIsEditMode(false);
    setSelectedContent(null);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-neutral-800 mb-4">لوحة التحكم</h2>
              <nav className="space-y-2">
                <Link href="/admin/dashboard">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                    <LayoutDashboard className="w-5 h-5 ml-2" />
                    الرئيسية
                  </span>
                </Link>
                <Link href="/admin/content">
                  <span className="flex items-center p-2 text-neutral-700 rounded-md bg-neutral-100 font-medium cursor-pointer">
                    <File className="w-5 h-5 ml-2" />
                    إدارة المحتوى
                  </span>
                </Link>
                <Link href="/admin/users">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                    <Users className="w-5 h-5 ml-2" />
                    إدارة المستخدمين
                  </span>
                </Link>
              </nav>
            </div>
            
            <div className="pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">إضافة محتوى جديد</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    resetForm();
                    form.setValue("contentType", ContentType.ARTICLE);
                    setIsAddMode(true);
                  }}
                  className="w-full flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  مقال علمي جديد
                </button>
                <button 
                  onClick={() => {
                    resetForm();
                    form.setValue("contentType", ContentType.EBOOK);
                    setIsAddMode(true);
                  }}
                  className="w-full flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm"
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  كتاب إلكتروني جديد
                </button>
                <button 
                  onClick={() => {
                    resetForm();
                    form.setValue("contentType", ContentType.PROJECT);
                    setIsAddMode(true);
                  }}
                  className="w-full flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm"
                >
                  <GraduationCap className="w-4 h-4 ml-2" />
                  مشروع تخرج جديد
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">إدارة المحتوى</h1>
                <p className="text-neutral-600">إدارة المقالات العلمية والكتب ومشاريع التخرج</p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddMode(true);
                }}
                className="bg-primary hover:bg-primary-dark"
              >
                <PlusCircle className="w-4 h-4 ml-2" />
                إضافة محتوى جديد
              </Button>
            </div>
            
            {/* Content form (add or edit) */}
            {(isAddMode || isEditMode) && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{isEditMode ? "تعديل المحتوى" : "إضافة محتوى جديد"}</CardTitle>
                  <CardDescription>
                    {isEditMode 
                      ? "قم بتعديل بيانات المحتوى المحدد" 
                      : "قم بإدخال بيانات المحتوى الجديد"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(isEditMode ? handleEditContent : handleAddContent)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العنوان</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل عنوان المحتوى" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الوصف</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="أدخل وصفًا للمحتوى" 
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("contentType") === ContentType.ARTICLE && (
                        <FormField
                          control={form.control}
                          name="articleText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نص المقال</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="أدخل نص المقال كاملاً هنا" 
                                  className="min-h-64 font-normal text-base" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                يمكنك كتابة نص المقال كاملاً هنا، وسيتم تخزينه كملف نصي مع إمكانية تنزيله كملف PDF لاحقاً
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع المحتوى</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع المحتوى" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ContentType.ARTICLE}>مقال علمي</SelectItem>
                                  <SelectItem value={ContentType.EBOOK}>كتاب إلكتروني</SelectItem>
                                  <SelectItem value={ContentType.PROJECT}>مشروع تخرج</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>القسم (اختياري)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر القسم المرتبط" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">بدون قسم</SelectItem>
                                  <SelectItem value={Department.HORTICULTURE}>البساتين</SelectItem>
                                  <SelectItem value={Department.CROPS}>المحاصيل</SelectItem>
                                  <SelectItem value={Department.SOIL}>الأراضي والمياه</SelectItem>
                                  <SelectItem value={Department.PROTECTION}>وقاية النبات</SelectItem>
                                  <SelectItem value={Department.OTHER}>أخرى</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="authorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المؤلف / الكاتب</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل اسم المؤلف" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("contentType") === ContentType.PROJECT && (
                          <FormField
                            control={form.control}
                            name="studentYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>سنة التخرج (لمشاريع التخرج)</FormLabel>
                                <FormControl>
                                  <Input placeholder="مثال: 2023" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="externalLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط خارجي (اختياري)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل رابط خارجي (اختياري)" {...field} />
                            </FormControl>
                            <FormDescription>
                              يمكنك إضافة رابط خارجي للمحتوى (مثل رابط PDF أو موقع خارجي)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            ملف المحتوى (PDF)
                          </label>
                          <div className="flex items-center space-x-reverse space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("content-file")?.click()}
                            >
                              <Upload className="w-4 h-4 ml-2" />
                              {contentFile ? "تغيير الملف" : "اختر ملفًا"}
                            </Button>
                            {contentFile && (
                              <span className="text-sm text-neutral-600">
                                {contentFile.name}
                              </span>
                            )}
                          </div>
                          <input
                            id="content-file"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setContentFile(e.target.files[0]);
                              }
                            }}
                          />
                          <p className="mt-1 text-sm text-neutral-500">
                            اختر ملف PDF للمحتوى (اختياري إذا كان هناك رابط خارجي)
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            صورة مصغرة (اختياري)
                          </label>
                          <div className="flex items-center space-x-reverse space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("thumbnail-file")?.click()}
                            >
                              <Upload className="w-4 h-4 ml-2" />
                              {thumbnailFile ? "تغيير الصورة" : "اختر صورة"}
                            </Button>
                            {thumbnailFile && (
                              <span className="text-sm text-neutral-600">
                                {thumbnailFile.name}
                              </span>
                            )}
                          </div>
                          <input
                            id="thumbnail-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setThumbnailFile(e.target.files[0]);
                              }
                            }}
                          />
                          <p className="mt-1 text-sm text-neutral-500">
                            اختر صورة مصغرة للمحتوى (اختياري)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-reverse space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-primary-dark"
                          disabled={isSubmitting}
                        >
                          {isSubmitting 
                            ? "جارٍ الحفظ..." 
                            : isEditMode ? "حفظ التعديلات" : "إضافة المحتوى"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {/* Content List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>قائمة المحتوى</CardTitle>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                      placeholder="بحث..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value={ContentType.ARTICLE}>المقالات</TabsTrigger>
                    <TabsTrigger value={ContentType.EBOOK}>الكتب</TabsTrigger>
                    <TabsTrigger value={ContentType.PROJECT}>المشاريع</TabsTrigger>
                  </TabsList>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>العنوان</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>المؤلف</TableHead>
                          <TableHead>تاريخ الإضافة</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              جارٍ تحميل البيانات...
                            </TableCell>
                          </TableRow>
                        ) : filteredContent.length > 0 ? (
                          filteredContent.map((content) => (
                            <TableRow key={content.id}>
                              <TableCell className="font-medium max-w-xs truncate">
                                {content.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {contentTypeLabels[content.contentType]}
                                </Badge>
                              </TableCell>
                              <TableCell>{content.authorName}</TableCell>
                              <TableCell>
                                {format(
                                  content.createdAt && typeof content.createdAt.toDate === 'function'
                                    ? content.createdAt.toDate()
                                    : typeof content.createdAt === 'string'
                                      ? new Date(content.createdAt)
                                      : new Date(),
                                  "d MMM yyyy",
                                  { locale: arEG }
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-reverse space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => editContent(content)}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => confirmDelete(content)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-neutral-500">لا يوجد محتوى مطابق لمعايير البحث</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? "جارٍ التحميل..." : "تحميل المزيد"}
                      </Button>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          {selectedContent && (
            <div className="py-2">
              <p className="font-medium">{selectedContent.title}</p>
              <p className="text-sm text-neutral-500 mt-1">{contentTypeLabels[selectedContent.contentType]}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteContent}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
