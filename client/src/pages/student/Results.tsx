import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Download, Printer, Upload, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from '../../components/ui/use-toast';
import { Progress } from '../../components/ui/progress';
import { StudentResult, getStudentResults, createStudentResult } from '../../lib/results.ts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function StudentResults() {
  const { user, userData } = useAuth();
  const [searchedResult, setSearchedResult] = useState<StudentResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // جلب النتائج من Firebase حسب رقم الجلوس أو البريد الجامعي
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['student-results', user?.email, userData?.academicId],
    queryFn: async () => {
      if (!user?.email && !userData?.academicId) {
        return null;
      }
      try {
        // البحث أولاً برقم الجلوس (academicId)
        if (userData?.academicId) {
          const resultsRef = collection(db, 'results');
          const q = query(resultsRef, where('academicId', '==', userData.academicId.toString()));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as StudentResult;
          }
        }
        // إذا لم توجد نتيجة برقم الجلوس، ابحث بالبريد الجامعي
        if (user?.email) {
          const resultsRef = collection(db, 'results');
          const q = query(resultsRef, where('universityEmail', '==', user.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as StudentResult;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!user?.email || !!userData?.academicId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (results) {
      setSearchedResult(results);
    }
  }, [results]);

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "خطأ في جلب النتائج",
        description: "حدث خطأ أثناء جلب النتائج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  }, [error]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!searchedResult) return;

    const content = `
      نتائج الطالب
      الاسم: ${searchedResult.name}
      الرقم الجامعي: ${searchedResult.academicId}
      القسم: ${searchedResult.department}
      الفرقة: ${searchedResult.level}
      الفصل الدراسي: ${searchedResult.semester}

      النتائج:
      ${searchedResult.subjects.map(subject => 
        `${subject.name}: ${subject.grade}`
      ).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتائج_${searchedResult.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    await refetch();
    setIsUploading(false);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // محاكاة بداية التحميل
      for (let i = 0; i <= 30; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const { success, failed } = await uploadResultsFromExcel(file);

      // محاكاة اكتمال التحميل
      for (let i = 40; i <= 100; i += 20) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "تم رفع النتائج بنجاح",
        description: `تم رفع ${success} نتيجة بنجاح${failed > 0 ? ` و ${failed} فشلت` : ''}`,
      });

      // تحديث النتائج
      await refetch();
    } catch (error) {
      console.error('Error uploading results:', error);
      toast({
        title: "خطأ في رفع النتائج",
        description: "حدث خطأ أثناء رفع النتائج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // إعادة تعيين قيمة input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                يرجى تسجيل الدخول لعرض النتائج
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!searchedResult) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                لم يتم العثور على نتائج
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>نتائجي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-end gap-4 print:hidden">
                {userData?.role === 'student' && (
                  <Button variant="outline" onClick={handleRefresh} disabled={isUploading}>
                    <Upload className="w-4 h-4 ml-2" />
                    تحديث النتائج
                  </Button>
                )}
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>جاري تحديث النتائج...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">معلومات الطالب</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium">{searchedResult.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الرقم الجامعي</p>
                    <p className="font-medium">{searchedResult.academicId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">القسم</p>
                    <p className="font-medium">{searchedResult.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الفرقة</p>
                    <p className="font-medium">{searchedResult.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الفصل الدراسي</p>
                    <p className="font-medium">{searchedResult.semester}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">النتائج</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 font-medium">المادة</th>
                        <th className="text-right py-3 font-medium">التقدير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedResult.subjects.map((subject, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">{subject.name}</td>
                          <td className="py-3 font-medium">{subject.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

function uploadResultsFromExcel(file: File): { success: any; failed: any; } | PromiseLike<{ success: any; failed: any; }> {
  throw new Error('Function not implemented.');
}
