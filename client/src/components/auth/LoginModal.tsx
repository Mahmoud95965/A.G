import React, { useState } from "react";
// استيراد زائف للتأكد من أن الوحدة تعرف الدوال
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmailPassword, loginWithGoogle, db, createUserDocument, updateUserRole } from "@/lib/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { UserRole } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import GoogleProfileModal from "./GoogleProfileModal";

const loginSchema = z.object({
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  password: z.string().min(6, { message: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onOpenSignup }: LoginModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // تحقق ما إذا كان البريد الإلكتروني هو الخاص بالمسؤول (للاختبار فقط)
      const isAdminEmail = values.email === "mahmoud@gmailcom";
      
      const userCredential = await loginWithEmailPassword(values.email, values.password);
      
      // تسجيل بيانات المستخدم للتصحيح
      console.log("Login successful:", userCredential);
      
      // محاولة إنشاء مستخدم مسؤول إذا كان البريد الإلكتروني هو mahmoud@gmailcom
      if (isAdminEmail) {
        try {
          // التحقق إذا كان المستخدم موجود بالفعل في Firestore
          const user = userCredential.user;
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (!userDoc.exists()) {
            console.log("Creating admin user document with createUserDocument function");
            
            // استخدام الوظيفة الجديدة لإنشاء وثيقة المستخدم المسؤول
            await createUserDocument(user, UserRole.ADMIN);
            console.log("Admin user document created successfully through createUserDocument");
          } else {
            console.log("Admin user document already exists, checking role");
            
            // التأكد من أن المستخدم لديه دور المسؤول
            const userData = userDoc.data();
            if (userData.role !== UserRole.ADMIN) {
              console.log("Updating user to admin role");
              await updateUserRole(user.uid, UserRole.ADMIN);
            }
          }
        } catch (err) {
          console.error("Error handling admin document:", err);
        }
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك إلى منصة كلية الزراعة بقنا",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "فشل تسجيل الدخول",
        description: "يرجى التحقق من بريدك الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      console.log("Google login successful:", userCredential);
      
      // التحقق إذا كان المستخدم موجود بالفعل في Firestore
      if (userCredential?.user) {
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          console.log("New Google user, showing profile setup modal");
          
          // تعيين المستخدم وإظهار النافذة المنبثقة للحصول على معلومات المستخدم
          setGoogleUser(user);
          setShowProfileModal(true);
          
          // لا نغلق النافذة الرئيسية بعد حتى يكمل المستخدم المعلومات
          setIsLoading(false);
          return;
        } else {
          console.log("User document already exists for Google login");
        }
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك إلى منصة كلية الزراعة بقنا",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "فشل تسجيل الدخول بحساب Google",
        description: "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // معالج إغلاق نافذة تحديث المعلومات
  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    setGoogleUser(null);
    
    // إغلاق نافذة تسجيل الدخول
    onClose();
    
    // إظهار رسالة نجاح
    toast({
      title: "تم تحديث المعلومات",
      description: "تم تحديث معلومات حسابك بنجاح",
    });
  };

  const handleSwitchToSignup = () => {
    onClose();
    onOpenSignup();
  };

  return (
    <>
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
              <h3 className="text-2xl font-bold text-neutral-800">تسجيل الدخول</h3>
              <p className="text-neutral-600 mt-1">أدخل بيانات الدخول للوصول إلى حسابك</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-neutral-600 mr-2"
                        >
                          تذكرني
                        </label>
                      </div>
                    )}
                  />
                  
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-neutral-300"></div>
                  <span className="flex-shrink mx-3 text-neutral-600 text-sm">أو</span>
                  <div className="flex-grow border-t border-neutral-300"></div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-white border border-neutral-300 text-neutral-700 font-medium py-2 px-4 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  تسجيل الدخول باستخدام Google
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-neutral-600">
                    ليس لديك حساب؟{" "}
                    <Button 
                      variant="link" 
                      className="text-primary font-medium hover:text-primary-dark p-0" 
                      onClick={handleSwitchToSignup}
                    >
                      إنشاء حساب جديد
                    </Button>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تحديث المعلومات لمستخدمي جوجل الجدد */}
      {showProfileModal && googleUser && (
        <GoogleProfileModal 
          isOpen={showProfileModal} 
          onClose={handleProfileModalClose}
          user={googleUser}
        />
      )}
    </>
  );
}
