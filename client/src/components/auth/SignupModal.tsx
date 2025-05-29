import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { registerWithEmailPassword } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole, Department } from "@shared/schema";
import { X } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "يجب أن يتكون الاسم الأول من حرفين على الأقل" }),
  lastName: z.string().min(2, { message: "يجب أن يتكون الاسم الأخير من حرفين على الأقل" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  password: z.string().min(6, { message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" }),
  role: z.enum(["student", "professor", "admin"], { 
    required_error: "يرجى اختيار نوع الحساب" 
  }),
  adminVerificationCode: z.string().optional(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onOpenLogin }: SignupModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showStudentFields, setShowStudentFields] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "student",
      adminVerificationCode: "",
      studentId: "",
      department: "",
      terms: false,
    },
  });

  // Watch for role changes to show/hide specific fields
  const role = form.watch("role");
  const [showAdminVerification, setShowAdminVerification] = useState(false);
  
  useEffect(() => {
    setShowStudentFields(role === "student");
    setShowAdminVerification(role === "admin");
  }, [role]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const displayName = `${values.firstName} ${values.lastName}`;
      
      // التحقق من رمز المسؤول إذا كان نوع الحساب مسؤول
      if (values.role === 'admin') {
        // رمز التحقق الصحيح هو Agri159208#
        if (!values.adminVerificationCode || values.adminVerificationCode !== 'Agri159208#') {
          throw new Error('رمز التحقق غير صحيح');
        }
      }
      
      await registerWithEmailPassword(values.email, values.password, {
        displayName,
        username: values.email.split('@')[0],
        role: values.role,
        department: values.department || undefined,
        studentId: values.studentId || undefined,
      });
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحبًا بك في منصة كلية الزراعة بقنا",
      });
      
      onClose();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onOpenLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="absolute top-3 left-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8 rounded-full"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-neutral-800">إنشاء حساب جديد</h3>
            <p className="text-neutral-600 mt-1">أدخل بياناتك لإنشاء حساب في منصة كلية الزراعة</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">الاسم الأول</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="الاسم الأول" 
                          disabled={isLoading}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">الاسم الأخير</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="الاسم الأخير" 
                          disabled={isLoading}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="أدخل البريد الإلكتروني" 
                        type="email" 
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="أدخل كلمة المرور" 
                        type="password" 
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">نوع الحساب</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="اختر نوع الحساب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">طالب</SelectItem>
                        <SelectItem value="professor">دكتور</SelectItem>
                        <SelectItem value="admin">مسؤول</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showStudentFields && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700">الرقم الجامعي</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="أدخل الرقم الجامعي" 
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700">القسم</FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="اختر القسم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="horticulture">البساتين</SelectItem>
                            <SelectItem value="crops">المحاصيل</SelectItem>
                            <SelectItem value="soil">الأراضي والمياه</SelectItem>
                            <SelectItem value="protection">وقاية النبات</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {showAdminVerification && (
                <FormField
                  control={form.control}
                  name="adminVerificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">رمز الإثبات</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="أدخل رمز إثبات المسؤول" 
                          type="password"
                          disabled={isLoading}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-reverse space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-neutral-600">
                        أوافق على{" "}
                        <a href="#" className="text-primary hover:text-primary-dark">
                          الشروط والأحكام
                        </a>{" "}
                        و{" "}
                        <a href="#" className="text-primary hover:text-primary-dark">
                          سياسة الخصوصية
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {isLoading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-neutral-600">
                  لديك حساب بالفعل؟{" "}
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-primary font-medium hover:text-primary-dark p-0" 
                    onClick={handleSwitchToLogin}
                  >
                    تسجيل الدخول
                  </Button>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
