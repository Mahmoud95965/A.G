import React, { useState } from "react";
import { createAdminUser, adminUser } from "@/scripts/createAdmin";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Key, Mail, User, Shield } from "lucide-react";

export default function CreateAdmin() {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);

  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await createAdminUser();
      setAdminData(result);
      setIsCreated(true);
    } catch (err: any) {
      console.error("Error creating admin:", err);
      setError(err.message || "حدث خطأ أثناء إنشاء حساب المسؤول");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-neutral-100 flex items-center justify-center">
      <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">إنشاء حساب المسؤول</CardTitle>
            <CardDescription>
              استخدم هذه الصفحة لإنشاء حساب مسؤول جديد في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCreated ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <AlertTitle className="text-green-700">تم الإنشاء بنجاح</AlertTitle>
                  <AlertDescription className="text-green-600">
                    تم إنشاء حساب المسؤول بنجاح. يمكنك استخدام البيانات التالية لتسجيل الدخول.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">البريد الإلكتروني:</span>
                    <code className="bg-neutral-100 px-2 py-1 rounded">{adminUser.email}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">كلمة المرور:</span>
                    <code className="bg-neutral-100 px-2 py-1 rounded">{adminUser.password}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">اسم المستخدم:</span>
                    <span>{adminUser.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">الصلاحية:</span>
                    <span>مسؤول النظام</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <h3 className="font-medium text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    ملاحظة هامة
                  </h3>
                  <p className="text-amber-700 mt-1 text-sm">
                    سيتم إنشاء حساب مسؤول جديد بالبيانات التالية. يرجى حفظ هذه البيانات في مكان آمن.
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">البريد الإلكتروني:</span>
                    <span>{adminUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">كلمة المرور:</span>
                    <span>{adminUser.password}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">اسم المستخدم:</span>
                    <span>{adminUser.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">الصلاحية:</span>
                    <span>مسؤول النظام</span>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!isCreated ? (
              <Button 
                className="w-full bg-primary hover:bg-primary-dark" 
                onClick={handleCreateAdmin}
                disabled={isCreating}
              >
                {isCreating ? "جارِ الإنشاء..." : "إنشاء حساب المسؤول"}
              </Button>
            ) : (
              <div className="w-full text-center text-neutral-600 text-sm">
                تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول باستخدام البيانات أعلاه.
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}