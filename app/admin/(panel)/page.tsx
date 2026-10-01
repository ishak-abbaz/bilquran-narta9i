import StatCard from "@/components/admin/stat-card";
import StatusBadge from "@/components/admin/status-badge";

import {
  getAdminDashboardStats,
  getLatestProducts,
  getRecentOrders,
} from "@/lib/data/admin";


function formatDZD(value: number) {
  return new Intl.NumberFormat("ar-DZ").format(value) + " د.ج";
}


export default async function AdminDashboardPage() {
  const [
    stats,
    recentOrders,
    latestProducts,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrders(),
    getLatestProducts(),
  ]);


  return (
    <section className="space-y-8">

      <div>
        <h1 className="text-3xl font-semibold">
          لوحة التحكم
        </h1>

        <p className="mt-2 text-muted-foreground">
          نظرة عامة على المتجر
        </p>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
        />

        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
        />

        <StatCard
          title="طلبات قيد الانتظار"
          value={stats.pendingOrders}
        />

        <StatCard
          title="طلبات ملغاة"
          value={stats.cancelledOrders}
        />

        <StatCard
          title="طلبات مكتملة"
          value={stats.deliveredOrders}
        />

        <StatCard
          title="إجمالي المبيعات"
          value={formatDZD(stats.revenue)}
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

            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-4 p-5"
              >

                <div>
                  <p className="font-medium">
                    {order.customer_name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {formatDZD(order.total ?? 0)}
                  </p>
                </div>


                <StatusBadge
                  status={order.status}
                />

              </div>
            ))}

          </div>

        </div>



        <div className="rounded-xl border border-border bg-background">

          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">
              آخر المنتجات
            </h2>
          </div>


          <div className="divide-y divide-border">

            {latestProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 p-5"
              >

                <p className="font-medium">
                  {product.name}
                </p>


                <p className="text-sm text-muted-foreground">
                  {formatDZD(product.price)}
                </p>

              </div>
            ))}

          </div>

        </div>


      </div>

    </section>
  );
}