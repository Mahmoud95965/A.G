import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { uploadResultsFromExcel } from "@/lib/results";
import { useAuth } from "@/contexts/AuthContext";

export default function UploadResults() {
  const { user, isAdmin } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // تحقق من الصلاحية
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">رفع النتائج الدراسية</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">غير مصرح لك برفع النتائج</h2>
          <p className="text-red-700">هذه الصفحة متاحة فقط للمسؤولين.</p>
        </div>
      </div>
    );
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار ملف صحيح أولاً",
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // محاكاة شريط التقدم
      for (let i = 0; i <= 40; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const { success, failed } = await uploadResultsFromExcel(file);
      for (let i = 50; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      toast({
        title: "تم رفع النتائج بنجاح",
        description: `تم رفع ${success} نتيجة${failed > 0 ? ` و${failed} فشلت` : ''}`,
      });
      setFile(null);
    } catch (error) {
      toast({
        title: "خطأ في رفع النتائج",
        description: "حدث خطأ أثناء رفع النتائج. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">رفع النتائج الدراسية</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">تعليمات تنسيق ملف النتائج:</h2>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>يجب أن يكون الملف بتنسيق Excel (.xlsx أو .xls)</li>
          <li>العمود الأول: اسم الطالب</li>
          <li>العمود الثاني: البريد الجامعي</li>
          <li>العمود الثالث: رقم الجلوس</li>
          <li>الأعمدة التالية: أسماء المواد والتقديرات</li>
        </ul>
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary-light bg-opacity-10' : 'border-neutral-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {file ? (
            <>
              <FileSpreadsheet className="w-12 h-12 text-primary mb-4" />
              <p className="text-neutral-700 mb-2">{file.name}</p>
              <p className="text-sm text-neutral-500">انقر أو اسحب ملفاً آخر لتغييره</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-neutral-400 mb-4" />
              <p className="text-neutral-700 mb-2">اسحب ملف Excel هنا أو انقر للاختيار</p>
              <p className="text-sm text-neutral-500">يدعم الملفات بتنسيق .xlsx و .xls</p>
            </>
          )}
        </div>
      </div>
      {isUploading && (
        <div className="mt-6">
          <Progress value={uploadProgress} className="w-full" />
          <div className="text-center text-sm mt-2">جاري رفع النتائج... {uploadProgress}%</div>
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          <Upload className="w-4 h-4 ml-2" />
          رفع النتائج
        </Button>
      </div>
    </div>
  );
} 