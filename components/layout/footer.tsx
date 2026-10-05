import Link from "next/link";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-bold tracking-[0.35em]">
            [YOUR STORE NAME]
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            متجر جزائري لبيع المصاحف والكتب الإسلامية،
            بتشكيلة مختارة بعناية وخدمة الدفع عند الاستلام.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            روابط سريعة
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <Link href="/">الرئيسية</Link>
            <Link href="/shop">
              المصاحف والكتب
            </Link>
            <Link href="/about">
              من نحن
            </Link>
            <Link href="/contact">
              اتصل بنا
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            التواصل
          </h3>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>الهاتف: 0698867385</p>
            <p>
              البريد: contact@bilquran-narta9i.dz
            </p>
            <p>الجزائر</p>
          </div>
        </div>
      </div>

      <div className="border-t py-5 text-center text-sm text-muted-foreground">
        © {year} [YOUR STORE NAME]. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}