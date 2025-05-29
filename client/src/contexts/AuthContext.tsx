import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, getUserByUid, createUserDocument } from "@/lib/firebase";
import { UserRole } from "@shared/schema";
import { DocumentData } from "firebase/firestore";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  isAdmin: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  isProfessor: false,
  isStudent: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // محاولة الحصول على وثيقة المستخدم
          const userDoc = await getUserByUid(firebaseUser.uid);
          
          if (userDoc) {
            // إذا تم العثور على وثيقة المستخدم، استخدمها
            setUserData(userDoc);
            console.log("Found existing user document:", userDoc);
          } else {
            console.log("No user document found, creating new document for user:", firebaseUser.uid);
            
            // تحقق إذا كان المستخدم هو المسؤول (للتطوير فقط)
            const isAdminEmail = firebaseUser.email === "mahmoud@gmail.com";
            
            // استخدام الوظيفة الجديدة لإنشاء وثيقة المستخدم
            const role = isAdminEmail ? UserRole.ADMIN : UserRole.STUDENT;
            const newUserData = await createUserDocument(firebaseUser, role);
            console.log("Created new user document:", newUserData);
            
            // تعيين وثيقة المستخدم الجديدة
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error handling user document:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Determine user roles
  const isAdmin = userData?.role === UserRole.ADMIN;
  const isProfessor = userData?.role === UserRole.PROFESSOR;
  const isStudent = userData?.role === UserRole.STUDENT;
  
  // للتصحيح: طباعة البيانات في وحدة التحكم
  console.log("AuthContext - userData:", userData);
  console.log("AuthContext - user roles:", { isAdmin, isProfessor, isStudent });

  const value = {
    user,
    userData,
    isAdmin,
    isProfessor,
    isStudent,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
