import { collection, query, where, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import * as XLSX from 'xlsx';

export interface StudentResult {
  id: string;
  name: string;
  universityEmail: string;
  academicId: string;
  department: string;
  level: string;
  semester: string;
  subjects: {
    name: string;
    grade: string;
  }[];
}

// جلب نتائج الطالب
export async function getStudentResults(email: string): Promise<StudentResult | null> {
  try {
    if (!email) {
      throw new Error('البريد الإلكتروني مطلوب للبحث عن النتائج');
    }

    const cleanEmail = email.toLowerCase().trim();
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, where('universityEmail', '==', cleanEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No results found for email:', cleanEmail);
      const q2 = query(resultsRef, where('universityEmail', '==', email));
      const snapshot2 = await getDocs(q2);

      if (snapshot2.empty) {
        return null;
      }

      const doc = snapshot2.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as StudentResult;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as StudentResult;
  } catch (error) {
    console.error('Error fetching student results:', error);
    throw error;
  }
}

// إنشاء نتيجة جديدة للطالب
export async function createStudentResult(data: Partial<StudentResult>): Promise<StudentResult> {
  try {
    if (!data.universityEmail) {
      throw new Error('البريد الجامعي مطلوب لإنشاء نتيجة جديدة');
    }

    const newResult: StudentResult = {
      id: data.id || Math.random().toString(),
      name: data.name || '',
      universityEmail: data.universityEmail.toLowerCase().trim(),
      academicId: data.academicId || '',
      department: data.department || '',
      level: data.level || '',
      semester: data.semester || '',
      subjects: data.subjects || []
    };

    const resultDoc = doc(db, 'results', newResult.id);
    await setDoc(resultDoc, newResult);

    console.log('Created new student result:', newResult);
    return newResult;
  } catch (error) {
    console.error('Error creating student result:', error);
    throw error;
  }
}

// رفع النتائج من ملف Excel
export async function uploadResultsFromExcel(file: File): Promise<void> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    const batch = writeBatch(db);

    (json as any[]).forEach((row, index) => {
      const id = row["ID"]?.toString() || Math.random().toString();
      const resultRef = doc(db, "results", id);

      // تأكد من تنسيق الأعمدة في ملف Excel كالتالي:
      // ID, Name, University Email, Academic ID, Department, Level, Semester, Subjects
      // حيث أن عمود Subjects يجب أن يكون JSON string يحتوي على [{ name, grade }, ...]
      const result: StudentResult = {
        id,
        name: row["Name"] || '',
        universityEmail: row["University Email"]?.toLowerCase().trim() || '',
        academicId: row["Academic ID"] || '',
        department: row["Department"] || '',
        level: row["Level"] || '',
        semester: row["Semester"] || '',
        subjects: [],
      };

      try {
        result.subjects = JSON.parse(row["Subjects"]);
      } catch (e) {
        console.warn(`تعذر تحويل مواد الطالب للسطر ${index + 2}:`, row["Subjects"]);
      }

      batch.set(resultRef, result);
    });

    await batch.commit();
    console.log('تم رفع النتائج بنجاح.');
  } catch (error) {
    console.error('حدث خطأ أثناء رفع النتائج من Excel:', error);
    throw error;
  }
}
