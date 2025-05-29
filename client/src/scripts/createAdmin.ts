import { createUserWithEmailAndPassword, updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp, getApp } from "firebase/app";
import { UserRole } from "@shared/schema";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAOv_iv-4ABm47wwxnP1MOtUHvDnqYCKvA",
  authDomain: "agriqena-159208.firebaseapp.com",
  databaseURL: "https://agriqena-159208-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agriqena-159208",
  storageBucket: "agriqena-159208.firebasestorage.app",
  messagingSenderId: "933041452699",
  appId: "1:933041452699:web:e1164cb9aacd36ae47b83e",
  measurementId: "G-8F9CQBNQ3K"
};

// Initialize Firebase only if not already initialized
let app;
let analytics;
try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
} catch (error) {
  // If Firebase is already initialized, get the existing app
  app = getApp();
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

// بيانات المستخدم المسؤول
const adminUser = {
  email: "mahmoud@gmail.com",
  password: "Mahmoud159208#",
  displayName: "محمود",
  role: UserRole.ADMIN,
  department: "other",
  username: "mahmoud",
  createdAt: new Date().toISOString()
};

// وظيفة لإنشاء حساب المسؤول
async function createAdminUser() {
  try {
    // إنشاء المستخدم في Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
    
    // تحديث اسم المستخدم
    await updateProfile(userCredential.user, {
      displayName: adminUser.displayName
    });
    
    // إنشاء وثيقة المستخدم في Firestore
    const userData = {
      displayName: adminUser.displayName,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      department: adminUser.department,
      createdAt: adminUser.createdAt,
      id: userCredential.user.uid
    };
    
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    console.log("تم إنشاء حساب المسؤول بنجاح!");
    console.log("البريد الإلكتروني:", adminUser.email);
    console.log("كلمة المرور:", adminUser.password);
    console.log("معرف المستخدم:", userCredential.user.uid);
    
    return userData;
  } catch (error) {
    console.error("خطأ في إنشاء حساب المسؤول:", error);
    throw error;
  }
}

// لا نقوم بتنفيذ الدالة مباشرة، سنقوم بإنشاء المستخدم من خلال وظيفة أخرى
export { createAdminUser, adminUser };