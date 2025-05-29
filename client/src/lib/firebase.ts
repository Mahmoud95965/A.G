import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, UserCredential, updateProfile, Auth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, orderBy, limit, DocumentData, QuerySnapshot, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from "firebase/storage";
import * as XLSX from 'xlsx';
import { User, UserRole, UserRoleType, InsertUser, ContentType, InsertContent } from "@shared/schema";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const contentCache = new Map<string, { data: any; timestamp: number }>();
const userCache = new Map<string, { data: any; timestamp: number }>();


import { getAnalytics } from "firebase/analytics";

// Firebase configuration
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

// Initialize Firebase with optimized settings
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;
let isFirestoreEnabled = false;
let analytics: any;
let isInitialized = false;

// Configure Google Auth Provider
const configureGoogleAuth = () => {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
};

// Check if Firestore is enabled
const checkFirestoreEnabled = async (): Promise<boolean> => {
  if (!db) return false;
  try {
    const testDoc = doc(db, '_test', '_test');
    await setDoc(testDoc, { timestamp: new Date() });
    await deleteDoc(testDoc);
    return true;
  } catch (error) {
    console.error("Firestore check failed:", error);
    return false;
  }
};

// Handle Firestore errors
const handleFirestoreError = (error: any) => {
  console.error('Firestore error:', error);
  if (error.code === 'permission-denied') {
    console.error('Permission denied. Please check your Firestore rules.');
  } else if (error.code === 'unavailable') {
    console.error('Firestore is currently unavailable. Please check your connection.');
  }
};

const initializeFirebase = async (retries = 3) => {
  if (isInitialized) {
    console.log("Firebase already initialized, returning existing instances");
    return;
  }
  
  try {
    console.log("Initializing Firebase...");
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    
    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);
    
    // Initialize Firestore with persistence settings
    console.log("Initializing Firestore...");
    try {
      // First try to get existing instance
      try {
        db = getFirestore(app);
        console.log("Using existing Firestore instance");
      } catch {
        // If no instance exists, create new one with persistence
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
        console.log("Created new Firestore instance with persistence");
      }
      
      // Test Firestore connection
      const testDoc = doc(db, '_test', '_test');
      await setDoc(testDoc, { timestamp: new Date() });
      await deleteDoc(testDoc);
      isFirestoreEnabled = true;
      console.log("Firestore initialized successfully");
    } catch (error) {
      console.error("Firestore initialization failed:", error);
      isFirestoreEnabled = false;
      throw error;
    }
    
    storage = getStorage(app);
    configureGoogleAuth();
    isInitialized = true;
    
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    if (retries > 0) {
      console.log(`Retrying Firebase initialization... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initializeFirebase(retries - 1);
    }
    throw error;
  }
};

// Initialize Firebase immediately
initializeFirebase().catch(error => {
  console.error("Failed to initialize Firebase:", error);
});

// Cache management functions
const clearExpiredCache = () => {
  const now = Date.now();
  contentCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      contentCache.delete(key);
    }
  });
  userCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      userCache.delete(key);
    }
  });
};

// Clear cache periodically
setInterval(clearExpiredCache, CACHE_DURATION);

// التحقق من رمز الإثبات للمسؤول
export const verifyAdminCode = (code: string): boolean => {
  // رمز الإثبات للمسؤول
  const ADMIN_SECRET_CODE = "Agri159208#";
  return code === ADMIN_SECRET_CODE;
};

// Authentication functions
export const loginWithEmailPassword = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmailPassword = async (email: string, password: string, userData: Partial<InsertUser>): Promise<UserCredential> => {
  try {
    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);
    
  console.log("Starting user registration with:", { email, userData });
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
    // Update display name if provided
    if (userData.displayName) {
      console.log("Updating display name to:", userData.displayName);
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });
    }
    
    const role = userData.role || UserRole.STUDENT;
    console.log("Creating user document with role:", role);
    
    const user = userCredential.user;
    Object.defineProperty(user, 'customData', {
      value: {
        displayName: userData.displayName,
        username: userData.username || email.split('@')[0],
        department: userData.department,
        studentId: userData.studentId
      },
      writable: false
    });
    
    await createUserDocument(user, role);
    
      // تحديث البيانات الإضافية مع التحقق من الصلاحية
      if (userData.department || (userData.studentId && role !== UserRole.STUDENT)) {
        console.log("Updating additional user data:", { 
          department: userData.department, 
          studentId: role !== UserRole.STUDENT ? userData.studentId : null 
        });
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        department: userData.department || null,
          studentId: role !== UserRole.STUDENT ? userData.studentId : null
      });
    }
  }
  
  return userCredential;
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'auth/email-already-in-use') {
      alert('البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.');
    } else if (error.code === 'auth/weak-password') {
      alert('كلمة المرور ضعيفة جداً. يرجى استخدام كلمة مرور أقوى.');
    } else if (error.code === 'auth/invalid-email') {
      alert('البريد الإلكتروني غير صالح. يرجى إدخال بريد إلكتروني صحيح.');
    } else {
      alert('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    }
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);
    
    // Configure Google Auth
    configureGoogleAuth();
    
    // Attempt login with popup
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google login successful");
    return result;
  } catch (error: any) {
    console.error("Google login error:", error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      alert('تم منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      alert('تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      alert('تم إلغاء طلب تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } else {
      alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
    throw error;
  }
};

export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

// Enhanced getUserByUid with initialization check
export const getUserByUid = async (uid: string, retries = 2): Promise<DocumentData | null> => {
  if (!isInitialized) {
    await initializeFirebase();
  }
  
  if (!isFirestoreEnabled) {
    throw new Error("Firestore is not enabled");
  }

  try {
    if (!uid) {
      console.warn("getUserByUid called with null or undefined uid");
      return null;
    }

    // Check cache first
    const cachedUser = userCache.get(uid);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_DURATION) {
      console.log("Returning cached user data for:", uid);
      return cachedUser.data;
    }

    console.log("Fetching user data for:", uid);
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() };
      // Update cache
      userCache.set(uid, { data: userData, timestamp: Date.now() });
      console.log("User data retrieved and cached:", userData);
      return userData;
    } else {
      console.log("No user document found with UID:", uid);
      return null;
    }
  } catch (error: any) {
    console.error("Error in getUserByUid:", error);
    
    if (retries > 0) {
      console.log(`Retrying getUserByUid... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getUserByUid(uid, retries - 1);
    }
    return null;
  }
};

export const createUserDocument = async (user: any, role: string = UserRole.STUDENT): Promise<DocumentData> => {
  try {
    if (!user?.uid) {
      throw new Error('Invalid user object: missing uid');
    }

    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    console.log("Creating user document for:", user.uid);
    
    const userData = {
      displayName: user.displayName || "User",
      email: user.email || "",
      username: user.email ? user.email.split('@')[0] : "user",
      role: role,
      createdAt: new Date().toISOString(),
      id: user.uid
    };
    
    console.log("About to create document with data:", userData);
    
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, userData);
    console.log("User document created successfully for:", user.uid);
    
    return userData;
  } catch (error: any) {
    console.error("Detailed error creating user document:", error);
    try {
      const minimalData = {
        email: user.email || "",
        role: role,
        createdAt: new Date().toISOString()
      };
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, minimalData);
      console.log("Created user document with minimal data");
      return minimalData;
    } catch (secondError: any) {
      console.error("Even minimal data failed:", secondError);
      throw error;
    }
  }
};

export const updateUserRole = async (uid: string, role: string): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { role });
};

// Batch user creation from Excel file
export interface ExcelUser {
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  password: string;
  role: string;
  errorMessage?: string;
}

export interface UploadProgress {
  total: number;
  current: number;
  percentage: number;
  success: number;
  failed: number;
}

export const createUsersFromExcel = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: ExcelUser[], failed: ExcelUser[] }> => {
  const result = { success: [] as ExcelUser[], failed: [] as ExcelUser[] };
  const BATCH_SIZE = 10; // عدد المستخدمين في كل مجموعة
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // استخراج البيانات من ملف الإكسل كمصفوفة من القيم
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // تحديد نوع الملف وترتيب الأعمدة
        let jsonData: ExcelUser[] = [];
        const defaultPassword = "Password123!"; // كلمة مرور افتراضية للطلاب
        
        // تفقد ما إذا كان الملف هو ملف إيميلات الطلاب
        let isStudentEmailFormat = false;
        if (rawData.length > 0 && Array.isArray(rawData[0]) && rawData[0].length > 0) {
          const firstCell = rawData[0][0];
          isStudentEmailFormat = typeof firstCell === 'string' && firstCell.includes('@');
        }
        
        if (isStudentEmailFormat) {
          // تحويل بيانات الإيميلات إلى الصيغة المطلوبة
          for (const row of rawData) {
            if (Array.isArray(row) && row.length > 0) {
              const firstCell = row[0];
              if (typeof firstCell === 'string' && firstCell.includes('@')) {
                const email = String(firstCell).trim();
                const username = email.split('@')[0];
                jsonData.push({
                  name: username,
                  email: email,
                  password: defaultPassword,
                  role: UserRole.STUDENT,
                  department: "قسم عام",
                  studentId: username,
                  errorMessage: undefined
                });
              }
            }
          }
        } else {
          // استخدام التنسيق القياسي لملف الإكسل
          jsonData = XLSX.utils.sheet_to_json<ExcelUser>(worksheet);
        }
        
        if (jsonData.length === 0) {
          throw new Error("لم يتم العثور على بيانات صالحة في الملف");
        }
        
        console.log("تم تحميل البيانات من الملف:", jsonData.length, "مستخدم");
        
        // تهيئة متغيرات التقدم
        const total = jsonData.length;
        let current = 0;
        let success = 0;
        let failed = 0;
        
        // تحديث التقدم
        const updateProgress = () => {
          current++;
          const percentage = Math.round((current / total) * 100);
          if (onProgress) {
            onProgress({
              total,
              current,
              percentage,
              success,
              failed
            });
          }
        };
        
        // تقسيم المستخدمين إلى مجموعات
        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
          const batch = jsonData.slice(i, i + BATCH_SIZE);
          
          // معالجة كل مجموعة من المستخدمين
          await Promise.all(batch.map(async (user) => {
            try {
              // التحقق من صحة البيانات
              if (!user.email || !user.email.includes('@')) {
                result.failed.push({
                  ...user,
                  errorMessage: "البريد الإلكتروني غير صالح"
                });
                failed++;
                updateProgress();
                return;
              }
              
              if (!user.name || user.name.trim().length === 0) {
                result.failed.push({
                  ...user,
                  errorMessage: "الاسم مطلوب"
                });
                failed++;
                updateProgress();
                return;
              }
              
              try {
                // محاولة إنشاء المستخدم
            await registerWithEmailPassword(user.email, user.password, {
              displayName: user.name,
              username: user.email.split('@')[0],
              role: user.role as string,
              department: user.department,
              studentId: user.studentId
            });
                
            result.success.push(user);
                success++;
              } catch (error: any) {
                // إذا كان الخطأ بسبب وجود البريد الإلكتروني
                if (error.code === 'auth/email-already-in-use') {
                  result.failed.push({
                    ...user,
                    errorMessage: "البريد الإلكتروني مستخدم بالفعل"
                  });
                  failed++;
                } else {
                  // إذا كان هناك خطأ آخر
                  result.failed.push({
                    ...user,
                    errorMessage: error.message || "حدث خطأ غير معروف"
                  });
                  failed++;
                }
              }
              updateProgress();
            } catch (error: any) {
              console.error("فشل في معالجة المستخدم:", user.email, error);
              result.failed.push({
                ...user,
                errorMessage: error.message || "حدث خطأ غير معروف"
              });
              failed++;
              updateProgress();
            }
          }));
          
          // إضافة تأخير صغير بين المجموعات لتجنب الضغط على الخادم
          if (i + BATCH_SIZE < jsonData.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        resolve(result);
      } catch (error: any) {
        console.error("خطأ في معالجة ملف الإكسل:", error);
        let errorMessage = "حدث خطأ أثناء معالجة الملف";
        
        if (error.message === "لم يتم العثور على بيانات صالحة في الملف") {
          errorMessage = "لم يتم العثور على بيانات صالحة في الملف. يرجى التأكد من تنسيق الملف";
        } else if (error.message.includes("Invalid file format")) {
          errorMessage = "تنسيق الملف غير صالح. يرجى التأكد من أن الملف بتنسيق Excel صحيح";
        }
        
        reject(new Error(errorMessage));
      }
    };
    
    reader.onerror = (error) => {
      console.error("خطأ في قراءة الملف:", error);
      reject(new Error("حدث خطأ أثناء قراءة الملف. يرجى التأكد من صحة الملف"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Function to create a beautiful article page
export const createArticlePage = (content: string, title: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        :root {
          --primary-color: #2e7d32;
          --secondary-color: #4caf50;
          --text-color: #333;
          --bg-color: #f8f9fa;
          --card-bg: #ffffff;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', 'Segoe UI', sans-serif;
          line-height: 1.8;
          background-color: var(--bg-color);
          color: var(--text-color);
          padding: 0;
          margin: 0;
          direction: rtl;
        }

        .article-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .article-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: var(--card-bg);
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .article-title {
          color: var(--primary-color);
          font-size: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .article-meta {
          color: #666;
          font-size: 0.9rem;
        }

        .article-content {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .article-section {
          margin-bottom: 2rem;
        }

        .article-section:last-child {
          margin-bottom: 0;
        }

        h1, h2, h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        h1 { font-size: 2.2rem; }
        h2 { font-size: 1.8rem; }
        h3 { font-size: 1.4rem; }

        p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          line-height: 1.8;
        }

        .description {
          font-style: italic;
          color: #555;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-right: 4px solid var(--secondary-color);
          border-radius: 4px;
        }

        ul {
          list-style-type: none;
          padding-right: 1.5rem;
          margin-bottom: 1.5rem;
        }

        ul li {
          margin-bottom: 0.8rem;
          position: relative;
          padding-right: 1.5rem;
        }

        ul li:before {
          content: "•";
          color: var(--secondary-color);
          position: absolute;
          right: 0;
          font-size: 1.2rem;
        }

        .highlight {
          background: #e8f5e9;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .article-container {
            padding: 1rem;
          }

          .article-title {
            font-size: 2rem;
          }

          .article-content {
            padding: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="article-container">
        <header class="article-header">
          <h1 class="article-title">${title}</h1>
          <div class="article-meta">
            ${new Date().toLocaleDateString('ar-SA', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>
        <main class="article-content">
          ${content}
        </main>
      </div>
    </body>
    </html>
  `;
};

// Modify addContent function to use the new article page format
export const addContent = async (content: InsertContent, file?: File): Promise<string> => {
  let fileUrl = content.fileUrl || "";
  let articleTextPath = null;
  
  // Format article content if it's an article
  if (content.contentType === 'article' && content.articleText) {
    // Create beautiful article page
    content.articleText = createArticlePage(content.articleText, content.title);
    
    try {
      // Create a safe filename from the title
      const safeTitle = content.title
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '_')
        .trim();
      
      const timestamp = Date.now();
      const filename = `article_${timestamp}_${safeTitle}.html`; // Always use .html extension
      
      // Send article text to server with correct content type
      const response = await fetch('/api/articles/text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-File-Extension': '.html' // Add header to indicate HTML file
        },
        body: JSON.stringify({
          id: timestamp.toString(),
          title: content.title,
          content: content.articleText,
          filename: filename,
          contentType: 'text/html' // Specify HTML content type
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      
      const data = await response.json();
      articleTextPath = data.fileName;
      console.log('Article saved successfully as HTML:', articleTextPath);
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    }
  }
  
  // Handle file upload if present
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', content.contentType);
      formData.append('title', content.title);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      fileUrl = data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  // Save content metadata
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...content,
        fileUrl,
        articleTextPath,
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    const data = await response.json();
    return data.id.toString();
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

export const updateContent = async (id: string, content: Partial<InsertContent>, file?: File): Promise<void> => {
  let fileUrl = content.fileUrl;
  let articleTextPath = content.articleTextPath;
  
  // رفع ملف جديد إذا تم تقديمه
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', content.contentType as string);
      formData.append('title', content.title || 'بدون عنوان');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('فشل في رفع الملف');
      }
      
      const data = await response.json();
      fileUrl = data.fileUrl;
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      // استمرار مع عملية التحديث
    }
  }
  
  // إذا كان المحتوى مقالاً وتم تقديم نص
  if (content.contentType === 'article' && content.articleText) {
    try {
      const response = await fetch('/api/articles/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id, // استخدام نفس المعرف
          title: content.title || 'عنوان المقال',
          content: content.articleText
        })
      });
      
      if (!response.ok) {
        throw new Error('فشل في حفظ نص المقال');
      }
      
      const data = await response.json();
      articleTextPath = data.fileName;
    } catch (error) {
      console.error('خطأ في حفظ نص المقال:', error);
      // استمرار مع عملية التحديث
    }
  }
  
  // تحديث بيانات المحتوى في الخادم
  try {
    const response = await fetch(`/api/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...content,
        fileUrl,
        articleTextPath,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('فشل في تحديث المحتوى');
    }
  } catch (error) {
    console.error('خطأ في تحديث المحتوى:', error);
    throw error;
  }
};

export const deleteContent = async (id: string): Promise<void> => {
  try {
    // حذف المحتوى من الخادم (سيتولى الخادم حذف الملفات المرتبطة)
    const response = await fetch(`/api/content/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('فشل في حذف المحتوى');
    }
  } catch (error) {
    console.error('خطأ في حذف المحتوى:', error);
    throw error;
  }
};

// Enhanced getRecentContent with caching and pagination
export const getRecentContent = async (limitCount = 6): Promise<DocumentData[]> => {
  try {
    const cacheKey = `recent_content_${limitCount}`;
    const cachedContent = contentCache.get(cacheKey);
    
    if (cachedContent && Date.now() - cachedContent.timestamp < CACHE_DURATION) {
      console.log("Returning cached recent content");
      return cachedContent.data;
    }

    const response = await fetch(`/api/contents?limit=${limitCount}`);
    
    if (!response.ok) {
      throw new Error('فشل في جلب المحتوى الحديث');
    }
    
    const data = await response.json();
    
    // Update cache
    contentCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('خطأ في جلب المحتوى الحديث:', error);
    return [];
  }
};

// Enhanced getContentByType with caching and optimized queries
export const getContentByType = async (contentType: string, departmentFilter?: string, limitCount = 10): Promise<DocumentData[]> => {
  try {
    const cacheKey = `content_${contentType}_${departmentFilter}_${limitCount}`;
    const cachedContent = contentCache.get(cacheKey);
    
    if (cachedContent && Date.now() - cachedContent.timestamp < CACHE_DURATION) {
      console.log("Returning cached content for type:", contentType);
      return cachedContent.data;
    }

    let url = `/api/contents/type/${contentType}`;
    if (departmentFilter) {
      url = `/api/contents/department/${departmentFilter}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('فشل في جلب المحتوى حسب النوع');
    }
    
    const data = await response.json();
    
    // Update cache
    contentCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('خطأ في جلب المحتوى حسب النوع:', error);
    return [];
  }
};

// Function to clear specific cache entries
export const clearCache = (type: 'content' | 'user' | 'all') => {
  if (type === 'content' || type === 'all') {
    contentCache.clear();
  }
  if (type === 'user' || type === 'all') {
    userCache.clear();
  }
};

export const updateUserProfile = async (uid: string, userData: Partial<InsertUser>): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const currentUserData = userDoc.data();
    const updates: Partial<InsertUser> = {};

    // التحقق من صلاحيات التعديل
    if (currentUserData.role === UserRole.STUDENT) {
      // الطلاب يمكنهم فقط تعديل القسم
      if (userData.department) {
        updates.department = userData.department;
      }
    } else if (currentUserData.role === UserRole.ADMIN) {
      // المسؤول يمكنه تعديل كل شيء
      Object.assign(updates, userData);
    } else if (currentUserData.role === UserRole.PROFESSOR) {
      // الدكتور يمكنه تعديل كل شيء ما عدا الرقم الجامعي
      const { studentId, ...allowedUpdates } = userData;
      Object.assign(updates, allowedUpdates);
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "users", uid), updates);
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export { auth, db, storage };