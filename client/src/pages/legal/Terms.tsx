import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">الشروط والأحكام</h1>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. القبول بالشروط</h2>
              <p className="text-muted-foreground">
                باستخدامك لمنصة قنا الزراعية، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. استخدام المنصة</h2>
              <p className="text-muted-foreground">
                يجب استخدام المنصة بشكل قانوني وأخلاقي. يحظر استخدام المنصة لأي غرض غير قانوني أو غير مصرح به.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. الحسابات والمستخدمين</h2>
              <p className="text-muted-foreground">
                يجب على المستخدمين تقديم معلومات دقيقة وكاملة عند التسجيل. المستخدم مسؤول عن الحفاظ على سرية حسابه وكلمة المرور الخاصة به.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. المحتوى</h2>
              <p className="text-muted-foreground">
                المستخدم مسؤول عن المحتوى الذي يقوم برفعه على المنصة. يجب أن يكون المحتوى قانونياً ولا ينتهك حقوق الملكية الفكرية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. التعديلات</h2>
              <p className="text-muted-foreground">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 