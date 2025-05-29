import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Library, GraduationCap, UserCheck } from "lucide-react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Stats {
  articles: number;
  books: number;
  projects: number;
  users: number;
}

export default function StatisticsSection() {
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0
  });
  const [displayStats, setDisplayStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articlesSnapshot, booksSnapshot, projectsSnapshot, usersSnapshot] = await Promise.all([
          getCountFromServer(collection(db, "articles")),
          getCountFromServer(collection(db, "books")),
          getCountFromServer(collection(db, "projects")),
          getCountFromServer(collection(db, "users"))
        ]);

        const newStats = {
          articles: articlesSnapshot.data().count,
          books: booksSnapshot.data().count,
          projects: projectsSnapshot.data().count,
          users: usersSnapshot.data().count
        };
        setStats(newStats);
        
        // Start counting animation
        const duration = 2000; // 2 seconds
        const steps = 50;
        const interval = duration / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          
          setDisplayStats({
            articles: Math.floor(newStats.articles * progress),
            books: Math.floor(newStats.books * progress),
            projects: Math.floor(newStats.projects * progress),
            users: Math.floor(newStats.users * progress)
          });
          
          if (currentStep >= steps) {
            clearInterval(timer);
          }
        }, interval);
        
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          articles: 0,
          books: 0,
          projects: 0,
          users: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-center">إحصائيات المنصة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 text-center">
          <Newspaper className="w-6 h-6 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">
            {isLoading ? "..." : `${displayStats.articles}+`}
          </h3>
          <p className="text-muted-foreground">مقال علمي</p>
          </div>
          
        <div className="p-6 text-center">
          <Library className="w-6 h-6 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">
            {isLoading ? "..." : `${displayStats.books}+`}
          </h3>
          <p className="text-muted-foreground">كتاب إلكتروني</p>
          </div>
          
        <div className="p-6 text-center">
          <GraduationCap className="w-6 h-6 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">
            {isLoading ? "..." : `${displayStats.projects}+`}
          </h3>
          <p className="text-muted-foreground">مشروع تخرج</p>
          </div>
          
        <div className="p-6 text-center">
          <UserCheck className="w-6 h-6 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">
            {isLoading ? "..." : `${displayStats.users}+`}
          </h3>
          <p className="text-muted-foreground">مستخدم نشط</p>
        </div>
      </div>
    </section>
  );
}
