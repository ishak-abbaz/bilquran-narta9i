import StatCard from "@/components/admin/stat-card";
import StatusBadge from "@/components/admin/status-badge";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  getAdminDashboardStats,
  getLatestBooks,
  getRecentOrders,
} from "@/lib/data/admin";
import {
  formatPrice,
} from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    stats,
    recentOrders,
    latestBooks,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrders(),
    getLatestBooks(),
  ]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">
          لوحة التحكم
        </h1>

        <p className="mt-2 text-muted-foreground">
          نظرة عامة على متجر بالقرآن نرتقي
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي الكتب"
          value={
            stats.totalProducts
          }
        />

        <StatCard
          title="التصنيفات"
          value={
            stats.totalCategories
          }
        />

        <StatCard
          title="إجمالي الطلبات"
          value={
            stats.totalOrders
          }
        />

        <StatCard
          title="طلبات قيد الانتظار"
          value={
            stats.pendingOrders
          }
        />

        <StatCard
          title="طلبات ملغاة"
          value={
            stats.cancelledOrders
          }
        />

        <StatCard
          title="طلبات مكتملة"
          value={
            stats.deliveredOrders
          }
        />

        <StatCard
          title="إجمالي المبيعات"
          value={formatPrice(
            stats.revenue,
          )}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-background">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">
              آخر الطلبات
            </h2>
          </div>

          <div className="divide-y divide-border">
            {recentOrders.length >
            0 ? (
              recentOrders.map(
                (order) => (
                  <div
                    key={
                      order.id
                    }
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-medium">
                        {
                          order.customer_name
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {formatPrice(
                          order.total ??
                            0,
                        )}
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        order.status
                      }
                    />
                  </div>
                ),
              )
            ) : (
              <p className="p-5 text-sm text-muted-foreground">
                لا توجد طلبات
                حالياً.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">
              آخر الكتب
            </h2>
          </div>

          <div className="divide-y divide-border">
            {latestBooks.length >
            0 ? (
              latestBooks.map(
                (book) => (
                  <div
                    key={
                      book.id
                    }
                    className="p-5"
                  >
                    <p className="font-medium">
                      {
                        book.name
                      }
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {book.publisher ??
                        "الناشر غير محدد"}
                    </p>
                  </div>
                ),
              )
            ) : (
              <p className="p-5 text-sm text-muted-foreground">
                لا توجد كتب
                حالياً.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}