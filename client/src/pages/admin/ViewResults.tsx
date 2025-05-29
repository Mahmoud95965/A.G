import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Download, Printer, Filter } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from '../../components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from '../../contexts/AuthContext';

interface StudentResult {
  id: string;
  name: string;
  universityEmail: string;
  academicId: string;
  department: string;
  level: string;
  semester: string;
  subjects: {
    name: string;
    grade: string;
  }[];
}

export default function ViewResults() {
  const { user, userData } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedResult, setSearchedResult] = useState<StudentResult | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');

  const { data: results, isLoading } = useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      try {
        const resultsRef = collection(db, 'results');
        const q = query(resultsRef, orderBy('academicId', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentResult[];
      } catch (error) {
        console.error('Error fetching results:', error);
        return [];
      }
    }
  });

  const handleSearch = (email?: string) => {
    const searchValue = email || searchEmail;
    
    if (!results || !searchValue?.trim()) {
      toast({
        title: "خطأ في البحث",
        description: "يرجى إدخال البريد الإلكتروني الجامعي",
        variant: "destructive",
      });
      return;
    }
    
    const result = results.find(
      result => result.universityEmail?.toLowerCase() === searchValue.trim().toLowerCase()
    );
    
    if (result) {
      setSearchedResult(result);
      toast({
        title: "تم العثور على النتائج",
        description: "تم العثور على نتائج الطالب بنجاح",
      });
    } else {
      setSearchedResult(null);
      toast({
        title: "لم يتم العثور على نتائج",
        description: "يرجى التحقق من البريد الإلكتروني الجامعي",
        variant: "destructive",
      });
    }
  };

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

  const filteredResults = results?.filter(result => {
    if (filterDepartment !== 'all' && result.department !== filterDepartment) return false;
    if (filterLevel !== 'all' && result.level !== filterLevel) return false;
    if (filterSemester !== 'all' && result.semester !== filterSemester) return false;
    return true;
  });

  if (userData?.role === 'student') {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">غير مصرح لك بعرض هذه الصفحة</h2>
            <p className="text-red-700">هذه الصفحة متاحة فقط للمسؤولين.</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>عرض نتائج الطلاب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* البحث */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="أدخل البريد الإلكتروني الجامعي"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={() => handleSearch()}>
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
              </div>

              {/* الفلاتر */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    <SelectItem value="horticulture">قسم البساتين</SelectItem>
                    <SelectItem value="crops">قسم المحاصيل</SelectItem>
                    <SelectItem value="soil">قسم الأراضي والمياه</SelectItem>
                    <SelectItem value="protection">قسم وقاية النبات</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفرق</SelectItem>
                    <SelectItem value="first">الفرقة الأولى</SelectItem>
                    <SelectItem value="second">الفرقة الثانية</SelectItem>
                    <SelectItem value="third">الفرقة الثالثة</SelectItem>
                    <SelectItem value="fourth">الفرقة الرابعة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفصل الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفصول</SelectItem>
                    <SelectItem value="first">الفصل الدراسي الأول</SelectItem>
                    <SelectItem value="second">الفصل الدراسي الثاني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchedResult ? (
              <div className="space-y-6 mt-6">
                <div className="flex justify-end gap-4 print:hidden">
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                </div>

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
            ) : (
              <div className="text-center text-muted-foreground mt-6">
                {searchEmail ? 'لم يتم العثور على نتائج' : 'قم بإدخال البريد الإلكتروني الجامعي للبحث'}
              </div>
            )}

            {/* عرض جميع النتائج المفلترة */}
            {!searchedResult && filteredResults && filteredResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">جميع النتائج</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 font-medium">الاسم</th>
                        <th className="text-right py-3 font-medium">الرقم الجامعي</th>
                        <th className="text-right py-3 font-medium">البريد الإلكتروني</th>
                        <th className="text-right py-3 font-medium">القسم</th>
                        <th className="text-right py-3 font-medium">الفرقة</th>
                        <th className="text-right py-3 font-medium">الفصل الدراسي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result) => (
                        <tr 
                          key={result.id} 
                          className="border-b cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            if (result.universityEmail) {
                              setSearchEmail(result.universityEmail);
                              handleSearch(result.universityEmail);
                            }
                          }}
                        >
                          <td className="py-3">{result.name}</td>
                          <td className="py-3">{result.academicId}</td>
                          <td className="py-3">{result.universityEmail}</td>
                          <td className="py-3">{result.department}</td>
                          <td className="py-3">{result.level}</td>
                          <td className="py-3">{result.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 