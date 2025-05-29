import React, { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image, Briefcase } from "lucide-react";

interface Research {
  id: string;
  title: string;
  author: string;
  date: string;
  abstract: string;
  fileUrl: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

interface DepartmentContentProps {
  departmentId: string;
  departmentName: string;
}

export default function DepartmentContent({ departmentId, departmentName }: DepartmentContentProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("research");

  // هذه البيانات ستأتي من قاعدة البيانات
  const researches: Research[] = [
    {
      id: "1",
      title: "دراسة تأثير الري على إنتاجية محصول القمح",
      author: "د. أحمد محمد",
      date: "2024-03-15",
      abstract: "دراسة شاملة لتأثير أنظمة الري المختلفة على إنتاجية محصول القمح في ظروف جنوب مصر",
      fileUrl: "/research/1.pdf"
    }
  ];

  const projects: Project[] = [
    {
      id: "1",
      title: "مشروع تحسين إنتاجية البطاطس",
      description: "مشروع بحثي لتحسين إنتاجية محصول البطاطس باستخدام تقنيات حديثة",
      imageUrl: "/projects/1.jpg",
      date: "2024-03-10"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">محتوى {departmentName}</h1>
        <p className="text-muted-foreground">
          استكشف الأبحاث والمشاريع والموارد المتاحة في قسم {departmentName}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            الأبحاث
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            المشاريع
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            معرض الصور
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-4">
          {researches.map((research) => (
            <Card key={research.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{research.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span>{research.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(research.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <p className="text-muted-foreground mb-4">{research.abstract}</p>
                <a
                  href={research.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  تحميل البحث
                </a>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground mb-4">{project.description}</p>
                <div className="text-sm text-muted-foreground">
                  {new Date(project.date).toLocaleDateString('ar-EG')}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gallery" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* هنا سيتم عرض الصور من قاعدة البيانات */}
          <div className="aspect-square bg-muted rounded-lg"></div>
          <div className="aspect-square bg-muted rounded-lg"></div>
          <div className="aspect-square bg-muted rounded-lg"></div>
          <div className="aspect-square bg-muted rounded-lg"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 