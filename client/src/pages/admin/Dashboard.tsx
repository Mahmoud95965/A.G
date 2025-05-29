import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  File, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  PlusCircle, 
  BarChart3,
  LayoutDashboard,
  Shield
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { ContentType, UserRole } from "@shared/schema";

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, userData, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, professors: 0, admins: 0 },
    content: { total: 0, articles: 0, ebooks: 0, projects: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get user counts
        const usersCollection = collection(db, "users");
        const totalUsers = await getCountFromServer(usersCollection);
        
        const studentQuery = query(usersCollection, where("role", "==", UserRole.STUDENT));
        const studentCount = await getCountFromServer(studentQuery);
        
        const professorQuery = query(usersCollection, where("role", "==", UserRole.PROFESSOR));
        const professorCount = await getCountFromServer(professorQuery);
        
        const adminQuery = query(usersCollection, where("role", "==", UserRole.ADMIN));
        const adminCount = await getCountFromServer(adminQuery);
        
        // Get content counts
        const contentsCollection = collection(db, "contents");
        const totalContent = await getCountFromServer(contentsCollection);
        
        const articlesQuery = query(contentsCollection, where("contentType", "==", ContentType.ARTICLE));
        const articlesCount = await getCountFromServer(articlesQuery);
        
        const ebooksQuery = query(contentsCollection, where("contentType", "==", ContentType.EBOOK));
        const ebooksCount = await getCountFromServer(ebooksQuery);
        
        const projectsQuery = query(contentsCollection, where("contentType", "==", ContentType.PROJECT));
        const projectsCount = await getCountFromServer(projectsQuery);
        
        setStats({
          users: {
            total: totalUsers.data().count,
            students: studentCount.data().count,
            professors: professorCount.data().count,
            admins: adminCount.data().count
          },
          content: {
            total: totalContent.data().count,
            articles: articlesCount.data().count,
            ebooks: ebooksCount.data().count,
            projects: projectsCount.data().count
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, toast]);

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
                  <span className="flex items-center p-2 text-neutral-700 rounded-md bg-neutral-100 font-medium cursor-pointer">
                    <LayoutDashboard className="w-5 h-5 ml-2" />
                    الرئيسية
                  </span>
                </Link>
                <Link href="/admin/content">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
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
                <Link href="/admin/content?type=article&action=new">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm cursor-pointer">
                    <FileText className="w-4 h-4 ml-2" />
                    مقال علمي جديد
                  </span>
                </Link>
                <Link href="/admin/content?type=ebook&action=new">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm cursor-pointer">
                    <BookOpen className="w-4 h-4 ml-2" />
                    كتاب إلكتروني جديد
                  </span>
                </Link>
                <Link href="/admin/content?type=project&action=new">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm cursor-pointer">
                    <GraduationCap className="w-4 h-4 ml-2" />
                    مشروع تخرج جديد
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">إعدادات النظام</h3>
              <div className="space-y-2">
                <Link href="/admin/create-admin">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm cursor-pointer bg-yellow-50 border border-yellow-100">
                    <PlusCircle className="w-4 h-4 ml-2 text-amber-600" />
                    إنشاء حساب مسؤول
                  </span>
                </Link>
                <Link href="/admin/actions">
                  <span className="flex items-center p-2 text-neutral-600 rounded-md hover:bg-neutral-100 transition-colors text-sm cursor-pointer bg-rose-50 border border-rose-100">
                    <Shield className="w-4 h-4 ml-2 text-rose-600" />
                    إجراءات متقدمة
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-800">مرحبًا، {userData?.displayName}</h1>
              <p className="text-neutral-600">هذه لوحة التحكم الخاصة بإدارة منصة كلية الزراعة بقنا</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Total users card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-neutral-500">إجمالي المستخدمين</p>
                      <p className="text-3xl font-bold">{isLoading ? "..." : stats.users.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Total content card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-neutral-500">إجمالي المحتوى</p>
                      <p className="text-3xl font-bold">{isLoading ? "..." : stats.content.total}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <File className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick add button */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-neutral-500">إضافة محتوى</p>
                      <p className="text-lg font-bold">إضافة سريعة</p>
                    </div>
                    <Link href="/admin/content?action=new">
                      <div className="cursor-pointer">
                        <Button className="bg-primary hover:bg-primary-dark">
                          <PlusCircle className="h-4 w-4 ml-1" />
                          إضافة
                        </Button>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="users">المستخدمين</TabsTrigger>
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="site-info">معلومات الموقع</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات المستخدمين</CardTitle>
                    <CardDescription>توزيع المستخدمين حسب الأدوار</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <p>جارٍ تحميل البيانات...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">الطلاب</p>
                          <p className="text-2xl font-bold">{stats.users.students}</p>
                        </div>
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">الدكاترة</p>
                          <p className="text-2xl font-bold">{stats.users.professors}</p>
                        </div>
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">المسؤولين</p>
                          <p className="text-2xl font-bold">{stats.users.admins}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Link href="/admin/users">
                        <div className="cursor-pointer">
                          <Button variant="outline">إدارة المستخدمين</Button>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>إحصائيات المحتوى</CardTitle>
                    <CardDescription>توزيع المحتوى حسب النوع</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <p>جارٍ تحميل البيانات...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">المقالات العلمية</p>
                          <p className="text-2xl font-bold">{stats.content.articles}</p>
                        </div>
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">الكتب الإلكترونية</p>
                          <p className="text-2xl font-bold">{stats.content.ebooks}</p>
                        </div>
                        <div className="bg-neutral-100 p-4 rounded-lg text-center">
                          <p className="text-sm text-neutral-500 mb-2">مشاريع التخرج</p>
                          <p className="text-2xl font-bold">{stats.content.projects}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Link href="/admin/content">
                        <div className="cursor-pointer">
                          <Button variant="outline">إدارة المحتوى</Button>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="site-info">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات عامة عن الموقع</CardTitle>
                    <CardDescription>بيانات إحصائية عن منصة كلية الزراعة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <p>جارٍ تحميل البيانات...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-primary/10 p-6 rounded-lg">
                            <h3 className="text-lg font-bold text-primary mb-4">إحصائيات عامة</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">إجمالي المستخدمين:</span>
                                <span className="font-bold">{stats.users.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">إجمالي المحتوى:</span>
                                <span className="font-bold">{stats.content.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">النسبة المئوية للطلاب:</span>
                                <span className="font-bold">
                                  {stats.users.total > 0
                                    ? Math.round((stats.users.students / stats.users.total) * 100)
                                    : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-bold text-green-700 mb-4">معلومات الموقع</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">اسم الموقع:</span>
                                <span className="font-bold">منصة كلية الزراعة بقنا</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">الإصدار الحالي:</span>
                                <span className="font-bold">1.0.0</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">آخر تحديث:</span>
                                <span className="font-bold">{new Date().toLocaleDateString('ar-EG')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-6 rounded-lg">
                          <h3 className="text-lg font-bold text-blue-700 mb-4">توزيع المستخدمين حسب الأقسام</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded shadow-sm text-center">
                              <p className="text-neutral-500 text-sm mb-1">البساتين</p>
                              <p className="font-bold">-</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm text-center">
                              <p className="text-neutral-500 text-sm mb-1">المحاصيل</p>
                              <p className="font-bold">-</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm text-center">
                              <p className="text-neutral-500 text-sm mb-1">الأراضي والمياه</p>
                              <p className="font-bold">-</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm text-center">
                              <p className="text-neutral-500 text-sm mb-1">وقاية النبات</p>
                              <p className="font-bold">-</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
