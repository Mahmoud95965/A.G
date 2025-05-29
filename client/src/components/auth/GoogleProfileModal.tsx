import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole, createUserDocument } from "@/lib/firebase";
import { UserRole } from "@shared/schema";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GoogleProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function GoogleProfileModal({ isOpen, onClose, user }: GoogleProfileModalProps) {
  const [name, setName] = useState(user?.displayName || "");
  const [role, setRole] = useState<string>(UserRole.STUDENT);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "خطأ في تعبئة النموذج",
        description: "الرجاء إدخال الاسم الكامل",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من رمز الإثبات إذا اختار المستخدم دور المسؤول
    if (role === UserRole.ADMIN) {
      // التحقق من رمز الإثبات
      if (verificationCode !== "Agri159208#") {
        toast({
          title: "رمز التحقق غير صحيح",
          description: "الرجاء التحقق من رمز الإثبات للمسؤول والمحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // تحديث الاسم في حساب Firebase
      if (user) {
        // تحديث الملف الشخصي في Firebase Authentication
        await updateProfile(user, { displayName: name });
        
        // التحقق مما إذا كان المستخدم موجودًا بالفعل في Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          // إنشاء مستخدم جديد في Firestore
          await createUserDocument(user, role);
        } else {
          // تحديث معلومات المستخدم في Firestore إذا كان موجودًا
          await updateDoc(doc(db, "users", user.uid), {
            displayName: name,
            role: role,
          });
        }
      }
      
      toast({
        title: "تم تحديث المعلومات",
        description: "تم تحديث معلومات حسابك بنجاح",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ في تحديث المعلومات",
        description: error.message || "حدث خطأ أثناء تحديث معلومات حسابك",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إكمال معلومات الحساب</DialogTitle>
          <DialogDescription>
            يرجى إكمال المعلومات التالية للمتابعة
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-1">
                الاسم الكامل
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right col-span-1">
                نوع الحساب
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.STUDENT}>طالب</SelectItem>
                  <SelectItem value={UserRole.PROFESSOR}>دكتور</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>مسؤول</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {role === UserRole.ADMIN && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="verificationCode" className="text-right col-span-1">
                  رمز الإثبات
                </Label>
                <Input
                  id="verificationCode"
                  type="password"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="col-span-3"
                  placeholder="أدخل رمز الإثبات للمسؤول"
                  required={role === UserRole.ADMIN}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ الحفظ..." : "حفظ المعلومات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}