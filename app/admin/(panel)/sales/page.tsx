import Link from "next/link";

import SalesChart from "@/components/admin/sales-chart";
import StatCard from "@/components/admin/stat-card";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  getSalesData,
  parseSalesRange,
  type SalesRange,
} from "@/lib/data/sales";
import {
  formatPrice,
} from "@/lib/utils";

type SalesPageProps = {
  searchParams: Promise<{
    range?: string;
  }>;
};

const RANGE_OPTIONS: Array<{
  value: SalesRange;
  label: string;
}> = [
  {
    value: "24h",
    label:
      "آخر 24 ساعة",
  },
  {
    value: "7d",
    label:
      "آخر 7 أيام",
  },
  {
    value: "30d",
    label:
      "آخر 30 يوماً",
  },
];

export default async function SalesPage({
  searchParams,
}: SalesPageProps) {
  await requireAdmin();

  const params =
    await searchParams;

  const range =
    parseSalesRange(
      params.range,
    );

  const {
    summary,
    timeline,
    books,
    categories,
  } = await getSalesData(
    range,
  );

  return (
    <section className="space-y-8">
      <header>
        <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
          التقارير
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          نظرة على المبيعات
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          متابعة الإيرادات
          والطلبات وأداء الكتب
          والتصنيفات. الطلبات
          الملغاة مستبعدة من جميع
          الأرقام.
        </p>
      </header>

      {/* Range tabs */}
      <nav
        aria-label="الفترة الزمنية"
        className="flex flex-wrap gap-2"
      >
        {RANGE_OPTIONS.map(
          (
            option,
          ) => {
            const active =
              option.value ===
              range;

            return (
              <Link
                key={
                  option.value
                }
                href={`/admin/sales?range=${option.value}`}
                className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {
                  option.label
                }
              </Link>
            );
          },
        )}
      </nav>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="الإيرادات"
          value={formatPrice(
            summary.revenue,
          )}
        />

        <StatCard
          title="عدد الطلبات"
          value={
            summary.orderCount
          }
        />

        <StatCard
          title="الكتب المباعة"
          value={
            summary.booksSold
          }
        />

        <StatCard
          title="متوسط قيمة الطلب"
          value={formatPrice(
            Math.round(
              summary.averageOrderValue,
            ),
          )}
        />
      </div>

      {/* Revenue chart */}
      <section className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            الإيرادات عبر الزمن
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {range ===
            "24h"
              ? "الإيرادات لكل ساعة."
              : "الإيرادات لكل يوم."}
          </p>
        </div>

        <SalesChart
          data={
            timeline
          }
          range={
            range
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Book performance */}
        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-bold">
              أداء الكتب
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              مرتبة حسب إيرادات
              الكتب، دون رسوم
              التوصيل.
            </p>
          </div>

          {books.length ===
          0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              لا توجد مبيعات كتب
              في هذه الفترة.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      عنوان الكتاب
                    </th>

                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الكمية
                    </th>

                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الإيرادات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {books.map(
                    (
                      book,
                      index,
                    ) => (
                      <tr
                        key={`${book.title}-${index}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {
                            book.title
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            book.quantitySold
                          }
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(
                            book.revenue,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Category performance */}
        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-bold">
              المبيعات حسب التصنيف
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              تعتمد على التصنيف
              الحالي للكتاب.
            </p>
          </div>

          {categories.length ===
          0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              لا توجد مبيعات حسب
              التصنيف في هذه الفترة.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      التصنيف
                    </th>

                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الكتب المباعة
                    </th>

                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الإيرادات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (
                      category,
                    ) => (
                      <tr
                        key={
                          category.categoryName
                        }
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {
                            category.categoryName
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            category.quantitySold
                          }
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(
                            category.revenue,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}