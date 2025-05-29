import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">الخصوصية والأمان</h1>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. جمع المعلومات</h2>
              <p className="text-muted-foreground">
                نقوم بجمع المعلومات الضرورية فقط لتقديم خدماتنا. تشمل هذه المعلومات الاسم، البريد الإلكتروني، الرقم الجامعي، والقسم.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. استخدام المعلومات</h2>
              <p className="text-muted-foreground">
                نستخدم المعلومات التي نجمعها فقط لتقديم وتحسين خدماتنا. لا نقوم ببيع أو مشاركة معلوماتك مع أي طرف ثالث.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. حماية البيانات</h2>
              <p className="text-muted-foreground">
                نستخدم تقنيات تشفير متقدمة لحماية بياناتك. نقوم بتحديث إجراءات الأمان لدينا بانتظام لضمان أمان معلوماتك.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. حقوق المستخدم</h2>
              <p className="text-muted-foreground">
                لديك الحق في الوصول إلى معلوماتك الشخصية وتعديلها أو حذفها. يمكنك أيضاً طلب نسخة من بياناتك في أي وقت.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. ملفات تعريف الارتباط</h2>
              <p className="text-muted-foreground">
                نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. التغييرات في سياسة الخصوصية</h2>
              <p className="text-muted-foreground">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 