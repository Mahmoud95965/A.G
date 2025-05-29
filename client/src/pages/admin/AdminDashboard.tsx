import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ContentType } from "@shared/schema";
import { GraduationCap, Users, FileText, BookOpen, Settings, Upload, BarChart, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";

interface Stats {
  articles: number;
  books: number;
  projects: number;
  users: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0,
  });
  const [displayStats, setDisplayStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const contentsCollection = collection(db, "contents");
        
        const articlesQuery = query(contentsCollection, where("contentType", "==", ContentType.ARTICLE));
        const articlesCount = await getCountFromServer(articlesQuery);
        
        const booksQuery = query(contentsCollection, where("contentType", "==", ContentType.EBOOK));
        const booksCount = await getCountFromServer(booksQuery);
        
        const projectsQuery = query(contentsCollection, where("contentType", "==", ContentType.PROJECT));
        const projectsCount = await getCountFromServer(projectsQuery);
        
        const usersCollection = collection(db, "users");
        const usersCount = await getCountFromServer(usersCollection);
        
        setStats({
          articles: articlesCount.data().count,
          books: booksCount.data().count,
          projects: projectsCount.data().count,
          users: usersCount.data().count,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStats({
          articles: 0,
          books: 0,
          projects: 0,
          users: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // تأثير التزايد التدريجي
  useEffect(() => {
    if (!isLoading) {
      const duration = 2000;
      const steps = 50;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setDisplayStats({
          articles: Math.floor(stats.articles * progress),
          books: Math.floor(stats.books * progress),
          projects: Math.floor(stats.projects * progress),
          users: Math.floor(stats.users * progress),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [isLoading, stats]);

  if (!userData || userData.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
          </CardHeader>
          <CardContent>
            <p>عذراً، هذه الصفحة متاحة فقط للمسؤولين.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* قسم الإحصائيات */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">إحصائيات المنصة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {isLoading ? "..." : `${displayStats.articles}+`}
              </div>
              <p className="text-muted-foreground">مقال علمي</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {isLoading ? "..." : `${displayStats.books}+`}
              </div>
              <p className="text-muted-foreground">كتاب إلكتروني</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {isLoading ? "..." : `${displayStats.projects}+`}
              </div>
              <p className="text-muted-foreground">مشروع تخرج</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {isLoading ? "..." : `${displayStats.users}+`}
              </div>
              <p className="text-muted-foreground">مستخدم مسجل</p>
            </div>
          </Card>
        </div>
      </section>

      <Tabs defaultValue="platform-services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform-services">خدمات المنصة</TabsTrigger>
          <TabsTrigger value="content-management">إدارة المحتوى</TabsTrigger>
          <TabsTrigger value="system-settings">إعدادات النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="platform-services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">إدارة المستخدمين</h3>
                    <p className="text-sm text-muted-foreground">إدارة حسابات المستخدمين والصلاحيات</p>
                  </div>
                </div>
                <Link to="/admin/users" className="mt-4 text-sm text-primary hover:underline block">
                  إدارة المستخدمين →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">رفع نتائج الطلاب</h3>
                    <p className="text-sm text-muted-foreground">رفع وتحديث نتائج الطلاب</p>
                  </div>
                </div>
                <Link to="/admin/upload-results" className="mt-4 text-sm text-primary hover:underline block">
                  رفع النتائج →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">عرض نتائج الطلاب</h3>
                    <p className="text-sm text-muted-foreground">عرض ومراجعة نتائج الطلاب</p>
                  </div>
                </div>
                <Link to="/admin/view-results" className="mt-4 text-sm text-primary hover:underline block">
                  عرض النتائج →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">المكتبة الرقمية</h3>
                    <p className="text-sm text-muted-foreground">إدارة الكتب والمراجع الإلكترونية</p>
                  </div>
                </div>
                <Link to="/admin/ebooks" className="mt-4 text-sm text-primary hover:underline block">
                  إدارة المكتبة →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">مشاريع التخرج</h3>
                    <p className="text-sm text-muted-foreground">إدارة مشاريع التخرج والبحوث</p>
                  </div>
                </div>
                <Link to="/admin/projects" className="mt-4 text-sm text-primary hover:underline block">
                  إدارة المشاريع →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Newspaper className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">المقالات العلمية</h3>
                    <p className="text-sm text-muted-foreground">إدارة المقالات والبحوث العلمية</p>
                  </div>
                </div>
                <Link to="/admin/articles" className="mt-4 text-sm text-primary hover:underline block">
                  إدارة المقالات →
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content-management" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إدارة المحتوى</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/admin/content")}
                >
                  إدارة المحتوى
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إدارة المقررات</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/admin/courses")}
                >
                  إدارة المقررات
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system-settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إعدادات النظام</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/admin/settings")}
                >
                  إعدادات النظام
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 