import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";

interface SubmitResearchProps {
  departmentId: string;
  departmentName: string;
}

export default function SubmitResearch({ departmentId, departmentName }: SubmitResearchProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("يجب تسجيل الدخول لتقديم البحث");
      return;
    }

    if (!formData.file) {
      toast.error("يرجى اختيار ملف البحث");
      return;
    }

    setLoading(true);

    try {
      // هنا سيتم إضافة كود رفع الملف وتقديم البحث
      // const formDataToSend = new FormData();
      // formDataToSend.append("title", formData.title);
      // formDataToSend.append("abstract", formData.abstract);
      // formDataToSend.append("keywords", formData.keywords);
      // formDataToSend.append("file", formData.file);
      // formDataToSend.append("departmentId", departmentId);
      // formDataToSend.append("userId", user.uid);

      toast.success("تم تقديم البحث بنجاح وسيتم مراجعته من قبل المسؤول");
      setLocation(`/departments/${departmentId}/content`);
    } catch (error) {
      console.error("Error submitting research:", error);
      toast.error("حدث خطأ أثناء تقديم البحث");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error("حجم الملف يجب أن لا يتجاوز 10 ميجابايت");
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">تقديم بحث جديد</h1>
          <p className="text-muted-foreground">
            قم بتقديم بحثك في قسم {departmentName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان البحث</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="أدخل عنوان البحث"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">ملخص البحث</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              placeholder="أدخل ملخص البحث"
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">الكلمات المفتاحية</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">ملف البحث (PDF)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              {formData.file && (
                <span className="text-sm text-muted-foreground">
                  {formData.file.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "جاري التقديم..." : "تقديم البحث"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/departments/${departmentId}/content`)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 