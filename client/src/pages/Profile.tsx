import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getUserByUid, db, storage } from "@/lib/firebase";
import { 
  updateDoc, 
  doc, 
  DocumentData,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@shared/schema";
import { Upload, User, BookOpen, GraduationCap, FileText, LayoutDashboard, Users, Download, Printer } from "lucide-react";
import { getStudentResults } from "@/lib/results";

// Profile form schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  department: z.string().optional(),
  studentId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const departmentLabels: Record<string, string> = {
  [Department.HORTICULTURE]: "البساتين",
  [Department.CROPS]: "المحاصيل",
  [Department.SOIL]: "الأراضي والمياه",
  [Department.PROTECTION]: "وقاية النبات",
  [Department.OTHER]: "أخرى",
};

interface Subject {
  name: string;
  grade: string;
}

interface StudentResult {
  id: string;
  name: string;
  academicId: string;
  department: string;
  level: string;
  semester: string;
  subjects: Subject[];
}

export default function Profile() {
  const { user, userData } = useAuth();
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isStudent = userData?.role === 'student';
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.email || !isStudent) return;
      
      setIsLoading(true);
      try {
        const result = await getStudentResults(user.email);
        if (result) {
          setStudentResults([result]);
        } else {
          setStudentResults([]);
          toast({
            title: "لم يتم العثور على نتائج",
            description: "لم يتم العثور على نتائج دراسية مرتبطة بحسابك",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "خطأ في جلب النتائج",
          description: "حدث خطأ أثناء محاولة جلب النتائج الدراسية",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [user?.email, isStudent]);

  const [location, navigate] = useLocation();
  const [contentStats, setContentStats] = useState({
    articles: 0,
    ebooks: 0,
    projects: 0
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userData?.displayName || "",
      department: userData?.department || "",
      studentId: userData?.studentId || "",
    },
  });
  
  useEffect(() => {
    if (!user) {
      navigate("/");
      toast({
        title: "غير مصرح بالوصول",
        description: "يجب تسجيل الدخول للوصول إلى الملف الشخصي",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);
  
  useEffect(() => {
    // Update form default values when userData changes
    if (userData) {
      form.reset({
        displayName: userData.displayName || "",
        department: userData.department || "",
        studentId: userData.studentId || "",
      });
    }
  }, [userData, form]);
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !userData) return;
    
    setIsLoading(true);
    
    try {
      let profilePictureUrl = userData.profilePicture || "";
      
      // Upload profile picture if provided
      if (profilePicture) {
        const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${profilePicture.name}`);
        await uploadBytes(storageRef, profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }
      
      // Update user profile in Firestore
      await updateDoc(doc(db, "users", userData.id), {
        displayName: values.displayName,
        department: values.department,
        studentId: values.studentId,
        ...(profilePicture ? { profilePicture: profilePictureUrl } : {}),
      });
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
      });
      
      // Reset profile picture state
      setProfilePicture(null);
      
      // Force a page reload to update the AuthContext with new user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ في تحديث الملف الشخصي",
        description: "حدث خطأ أثناء تحديث معلومات الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user || !userData) {
    // يمكننا إضافة رسالة تحميل هنا بدلاً من إرجاع null
    return (
      <div className="min-h-screen py-12 bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600">جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }
  
  // طباعة بيانات المستخدم في وحدة التحكم لأغراض التصحيح
  console.log("User data in profile:", userData);
  
  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Profile header */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center md:text-right md:flex md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={userData.profilePicture} alt={userData.displayName} />
                <AvatarFallback className="text-2xl">
                  {userData.displayName?.charAt(0) || userData.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">{userData.displayName}</h1>
                <p className="text-neutral-600">{userData.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  {userData.role === 'admin' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      مسؤول
                    </span>
                  )}
                  {userData.role === 'professor' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      دكتور
                    </span>
                  )}
                  {userData.role === 'student' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      طالب
                    </span>
                  )}
                  {userData.department && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                      {departmentLabels[userData.department] || userData.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {userData.role === 'admin' && (
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => navigate("/admin/dashboard")}
                  className="bg-primary hover:bg-primary-dark"
                >
                  لوحة التحكم
                </Button>
              </div>
            )}
          </div>
          
          {/* Profile tabs and content */}
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="personal-info">
                <User className="w-4 h-4 ml-2" />
                المعلومات الشخصية
              </TabsTrigger>
              {isStudent && (
                <TabsTrigger value="results">
                  <FileText className="w-4 h-4 ml-2" />
                  النتائج الدراسية
                </TabsTrigger>
              )}
              <TabsTrigger value="saved-content">
                <BookOpen className="w-4 h-4 ml-2" />
                المحتوى المحفوظ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                  <CardDescription>
                    قم بتعديل معلوماتك الشخصية وتحديث الصورة الرمزية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Profile picture */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          الصورة الشخصية
                        </label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-neutral-200">
                            <AvatarImage 
                              src={profilePicture ? URL.createObjectURL(profilePicture) : userData.profilePicture} 
                              alt={userData.displayName} 
                            />
                            <AvatarFallback>
                              {userData.displayName?.charAt(0) || userData.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("profile-picture")?.click()}
                              disabled={isLoading || userData?.role === 'student'}
                            >
                              <Upload className="w-4 h-4 ml-2" />
                              {profilePicture ? "تغيير الصورة" : "تحميل صورة"}
                            </Button>
                            <input
                              id="profile-picture"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setProfilePicture(e.target.files[0]);
                                }
                              }}
                              disabled={isLoading || userData?.role === 'student'}
                            />
                            <p className="mt-1 text-xs text-neutral-500">
                              يفضل صورة بحجم 200×200 بيكسل
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Full name */}
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسمك الكامل" {...field} readOnly={userData?.role === 'student'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Department (for students and professors) */}
                      {(userData.role === 'student' || userData.role === 'professor') && (
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>القسم</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={userData?.role === 'student'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر القسم" />
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
                      )}
                      
                      {/* Student ID (for students only) */}
                      {userData.role === 'student' && (
                        <FormField
                          control={form.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الرقم الجامعي</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل الرقم الجامعي" {...field} readOnly={userData?.role === 'student'} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {/* Email (read-only) */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          البريد الإلكتروني
                        </label>
                        <Input value={userData.email} disabled />
                        <p className="text-xs text-neutral-500">
                          لا يمكن تغيير البريد الإلكتروني
                        </p>
                      </div>
                      
                      {userData?.role !== 'student' && (
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary-dark"
                            disabled={isLoading}
                          >
                            {isLoading ? "جارِ الحفظ..." : "حفظ التغييرات"}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved-content">
              <Card>
                <CardHeader>
                  <CardTitle>المحتوى المحفوظ</CardTitle>
                  <CardDescription>
                    المحتوى الذي قمت بحفظه للرجوع إليه لاحقًا
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-neutral-300" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-700">لا يوجد محتوى محفوظ</h3>
                    <p className="mt-1 text-neutral-500">
                      ستظهر هنا العناصر التي تقوم بحفظها
                    </p>
                    <div className="mt-4 flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/articles")}
                      >
                        <FileText className="w-4 h-4 ml-2" />
                        تصفح المقالات
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/ebooks")}
                      >
                        <BookOpen className="w-4 h-4 ml-2" />
                        تصفح الكتب
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/projects")}
                      >
                        <GraduationCap className="w-4 h-4 ml-2" />
                        تصفح المشاريع
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isStudent && (
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>النتائج الدراسية</CardTitle>
                    <CardDescription>نتائجك الدراسية للفصول الدراسية المختلفة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {studentResults.length > 0 ? (
                      <div className="space-y-6">
                        {studentResults.map((result) => (
                          <div key={result.id} className="bg-neutral-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">
                                {result.semester || 'الفصل الدراسي'} - {result.level || 'المستوى الدراسي'}
                              </h3>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                                  <Printer className="h-4 w-4 ml-2" />
                                  طباعة
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  const content = `
نتائج الطالب
الاسم: ${result.name}
الرقم الجامعي: ${result.academicId}
القسم: ${result.department}
الفرقة: ${result.level}
الفصل الدراسي: ${result.semester}

النتائج:
${result.subjects?.map(subject => `${subject.name}: ${subject.grade}`).join('\n')}
                                  `;
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `نتائج_${result.semester}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                }}>
                                  <Download className="h-4 w-4 ml-2" />
                                  تحميل
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-white p-4 rounded-md shadow-sm">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-right py-2">المادة</th>
                                      <th className="text-right py-2">التقدير</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {result.subjects?.map((subject, index) => (
                                      <tr key={index} className="border-b">
                                        <td className="py-2">{subject.name}</td>
                                        <td className="py-2 font-medium">{subject.grade}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-neutral-300" />
                        <h3 className="mt-2 text-lg font-medium text-neutral-700">لا توجد نتائج متاحة</h3>
                        <p className="mt-1 text-neutral-500">
                          لم يتم رفع نتائجك الدراسية بعد
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          
          {/* Account info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-neutral-200">
                <div className="py-4 flex flex-col sm:flex-row">
                  <dt className="text-sm font-medium text-neutral-500 sm:w-40">تاريخ الانضمام</dt>
                  <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:ml-6">
                    {userData.createdAt ? 
                      (typeof userData.createdAt === 'string' 
                        ? new Date(userData.createdAt).toLocaleDateString('ar-EG') 
                        : typeof userData.createdAt.toDate === 'function'
                          ? new Date(userData.createdAt.toDate()).toLocaleDateString('ar-EG')
                          : new Date(userData.createdAt).toLocaleDateString('ar-EG')
                      ) 
                      : "غير متاح"}
                  </dd>
                </div>
                <div className="py-4 flex flex-col sm:flex-row">
                  <dt className="text-sm font-medium text-neutral-500 sm:w-40">نوع الحساب</dt>
                  <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:ml-6">
                    {userData.role === 'admin' ? "مسؤول" : userData.role === 'professor' ? "دكتور" : "طالب"}
                  </dd>
                </div>
                {userData.department && (
                  <div className="py-4 flex flex-col sm:flex-row">
                    <dt className="text-sm font-medium text-neutral-500 sm:w-40">القسم</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:ml-6">
                      {departmentLabels[userData.department] || userData.department}
                    </dd>
                  </div>
                )}
                {userData.studentId && (
                  <div className="py-4 flex flex-col sm:flex-row">
                    <dt className="text-sm font-medium text-neutral-500 sm:w-40">الرقم الجامعي</dt>
                    <dd className="mt-1 text-sm text-neutral-900 sm:mt-0 sm:ml-6">
                      {userData.studentId}
                    </dd>
                  </div>
                )}
                
                {/* Admin Dashboard Access */}
                {userData.role === 'admin' && (
                  <div className="py-4">
                    <dt className="text-sm font-medium text-neutral-500">لوحة تحكم المسؤول</dt>
                    <dd className="mt-2">
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => navigate("/admin/dashboard")}
                        >
                          <LayoutDashboard className="h-4 w-4 ml-2" />
                          الذهاب إلى لوحة التحكم
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate("/admin/users")}
                          >
                            <Users className="h-3 w-3 ml-1" />
                            إدارة المستخدمين
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate("/admin/content")}
                          >
                            <FileText className="h-3 w-3 ml-1" />
                            إدارة المحتوى
                          </Button>
                        </div>
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
