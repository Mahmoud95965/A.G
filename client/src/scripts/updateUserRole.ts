import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { UserRole } from "@shared/schema";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تحديث دور المستخدم إلى مسؤول
export async function updateUserToAdmin(email: string) {
  try {
    console.log("البحث عن المستخدم بالبريد الإلكتروني:", email);
    
    // البحث عن المستخدم بواسطة البريد الإلكتروني
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("لم يتم العثور على المستخدم بالبريد الإلكتروني:", email);
      return false;
    }
    
    // تحديث دور المستخدم
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log("تم العثور على المستخدم:", userId);
    console.log("بيانات المستخدم الحالية:", userDoc.data());
    
    // تحديث دور المستخدم إلى مسؤول
    await updateDoc(doc(db, "users", userId), { 
      role: UserRole.ADMIN 
    });
    
    console.log("تم تحديث دور المستخدم إلى مسؤول بنجاح!");
    return true;
  } catch (error) {
    console.error("خطأ في تحديث دور المستخدم:", error);
    return false;
  }
}

// تنفيذ الدالة لتحديث المستخدم المطلوب
updateUserToAdmin("mahmoud@gmail.com")
  .then((success) => {
    if (success) {
      console.log("تم تحديث دور المستخدم بنجاح. يمكن الآن تسجيل الدخول كمسؤول.");
    } else {
      console.log("فشل تحديث دور المستخدم، يرجى التحقق من السجلات للمزيد من التفاصيل.");
    }
  });