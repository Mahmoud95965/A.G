import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserRole } from "@shared/schema";

export default function AdminActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  
  const updateUserToAdmin = async (email: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setMessage("");
      
      console.log("البحث عن المستخدم بالبريد الإلكتروني:", email);
      
      // البحث عن المستخدم بواسطة البريد الإلكتروني
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError(`لم يتم العثور على المستخدم بالبريد الإلكتروني: ${email}`);
        return false;
      }
      
      // تحديث دور المستخدم
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      const userData = userDoc.data();
      setMessage(`تم العثور على المستخدم: ${userId}\nاسم المستخدم: ${userData.displayName}\nالدور الحالي: ${userData.role}`);
      
      // تحديث دور المستخدم إلى مسؤول
      await updateDoc(doc(db, "users", userId), { 
        role: UserRole.ADMIN 
      });
      
      setMessage(prev => prev + "\nتم تحديث دور المستخدم إلى مسؤول بنجاح!");
      setIsSuccess(true);
      return true;
    } catch (error: any) {
      console.error("خطأ في تحديث دور المستخدم:", error);
      setError(error.message || "حدث خطأ أثناء تحديث دور المستخدم");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle>إجراءات المسؤول</CardTitle>
          <CardDescription>أدوات خاصة لإدارة النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">تم بنجاح</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          
          {message && !isSuccess ? (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </div>
          ) : null}
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
            <h3 className="font-semibold text-amber-800">تحذير</h3>
            <p className="text-amber-700 text-sm">
              هذه العمليات حساسة وتؤثر مباشرة على صلاحيات المستخدمين في النظام.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={() => updateUserToAdmin("mahmoud@gmail.com")}
            disabled={isProcessing || isSuccess}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isProcessing ? "جارٍ التنفيذ..." : "ترقية mahmoud@gmail.com إلى مسؤول"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}