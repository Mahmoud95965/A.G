import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@shared/schema";
import { AlertCircle } from "lucide-react";

interface Result {
  id: string;
  studentId: string;
  semester: string;
  courses: {
    name: string;
    grade: string;
    points: number;
  }[];
  gpa: number;
  totalPoints: number;
}

export default function ViewResults() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user || !userData?.studentId) {
        setError("يجب تسجيل الدخول للوصول إلى النتائج");
        setLoading(false);
        return;
      }

      try {
        const resultsRef = collection(db, "results");
        const q = query(resultsRef, where("studentId", "==", userData.studentId));
        const querySnapshot = await getDocs(q);
        
        const resultsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Result[];

        setResults(resultsData);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("حدث خطأ أثناء جلب النتائج");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, userData]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">جاري تحميل النتائج...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">خطأ</h2>
            </div>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">النتائج الدراسية</h2>
            <p className="text-gray-600">لا توجد نتائج متاحة حالياً</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">النتائج الدراسية</h1>
      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">الفصل الدراسي: {result.semester}</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">المعدل التراكمي: {result.gpa}</p>
                  <p className="text-sm text-gray-600">مجموع النقاط: {result.totalPoints}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-4">المقرر</th>
                      <th className="text-right py-2 px-4">الدرجة</th>
                      <th className="text-right py-2 px-4">النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.courses.map((course, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{course.name}</td>
                        <td className="py-2 px-4">{course.grade}</td>
                        <td className="py-2 px-4">{course.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 