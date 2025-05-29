import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, FileText, Upload } from "lucide-react";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { getRecentContent } from "@/lib/firebase";

export default function HomePage() {
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecentContent = async () => {
      const content = await getRecentContent(6);
      setRecentContent(content);
    };
    fetchRecentContent();
  }, []);

  useEffect(() => {
    // Fetch user data and check if the user is an admin
    // This is a placeholder and should be replaced with actual implementation
    setUserData({ studentId: "12345" });
    setIsAdmin(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* قسم الإحصائيات */}
      <StatisticsSection />

      {/* قسم خدمات المنصة */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">خدمات المنصة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* المكتبة الرقمية */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">المكتبة الرقمية</h3>
            <p className="text-muted-foreground mb-4">تصفح الكتب والمراجع الإلكترونية</p>
            <Button asChild>
              <Link to="/ebooks">
                <BookOpen className="ml-2 h-4 w-4" />
                تصفح المكتبة
              </Link>
            </Button>
          </Card>

          {/* مشاريع التخرج */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">مشاريع التخرج</h3>
            <p className="text-muted-foreground mb-4">تصفح مشاريع التخرج والبحوث</p>
            <Button asChild>
              <Link to="/projects">
                <GraduationCap className="ml-2 h-4 w-4" />
                تصفح المشاريع
              </Link>
            </Button>
          </Card>

          {/* المقالات العلمية */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">المقالات العلمية</h3>
            <p className="text-muted-foreground mb-4">تصفح المقالات والبحوث العلمية</p>
            <Button asChild>
              <Link to="/articles">
                <FileText className="ml-2 h-4 w-4" />
                تصفح المقالات
              </Link>
            </Button>
          </Card>

          {/* النتائج الدراسية - للطلاب */}
          {userData?.studentId && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">النتائج الدراسية</h3>
              <p className="text-muted-foreground mb-4">عرض النتائج الدراسية الخاصة بك</p>
              <Button asChild>
                <Link to="/admin/view-results">
                  <FileText className="ml-2 h-4 w-4" />
                  عرض النتائج
                </Link>
              </Button>
            </Card>
          )}

          {/* إدارة النتائج - للمسؤولين */}
          {isAdmin && (
            <>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">رفع النتائج</h3>
                <p className="text-muted-foreground mb-4">رفع نتائج الطلاب الدراسية</p>
                <Button asChild>
                  <Link to="/admin/upload-results">
                    <Upload className="ml-2 h-4 w-4" />
                    رفع النتائج
                  </Link>
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">عرض جميع النتائج</h3>
                <p className="text-muted-foreground mb-4">عرض وإدارة نتائج جميع الطلاب</p>
                <Button asChild>
                  <Link to="/admin/view-results">
                    <FileText className="ml-2 h-4 w-4" />
                    عرض النتائج
                  </Link>
                </Button>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* قسم المحتوى الحديث */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">أحدث المحتوى</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentContent.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
                <p className="text-muted-foreground mb-4">{content.description}</p>
                <Button asChild>
                  <Link to={`/${content.contentType}/${content.id}`}>
                    عرض التفاصيل
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 