import Link from "next/link";

import OrderStatusDialog from "@/components/admin/order-status-dialog";
import StatusBadge from "@/components/admin/status-badge";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  getOrders,
} from "@/lib/data/orders";
import {
  formatPrice,
} from "@/lib/utils";

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

function getDeliveryLabel(
  deliveryType:
    | "home"
    | "desk",
) {
  return deliveryType ===
    "home"
    ? "للمنزل"
    : "للمكتب";
}

function buildPageHref(
  page: number,
  params: {
    search?: string;
    status?: string;
  },
) {
  const query =
    new URLSearchParams();

  query.set(
    "page",
    String(page),
  );

  if (
    params.search
  ) {
    query.set(
      "search",
      params.search,
    );
  }

  if (
    params.status &&
    params.status !==
      "all"
  ) {
    query.set(
      "status",
      params.status,
    );
  }

  return `/admin/orders?${query.toString()}`;
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdmin();

  const params =
    await searchParams;

  const parsedPage =
    Number(
      params.page ??
        "1",
    );

  const page =
    Number.isFinite(
      parsedPage,
    ) &&
    parsedPage > 0
      ? Math.floor(
          parsedPage,
        )
      : 1;

  const search =
    params.search ??
    "";

  const status =
    params.status ??
    "all";

  const {
    orders,
    totalPages,
  } = await getOrders({
    page,
    search,
    status,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">
          الطلبات
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          إدارة طلبات الكتب
          وحالات التوصيل.
        </p>
      </div>

      <form
        method="GET"
        className="flex flex-wrap gap-3"
      >
        <input
          name="search"
          defaultValue={
            search
          }
          placeholder="بحث بالاسم أو الهاتف"
          className="h-10 min-w-64 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <select
          name="status"
          defaultValue={
            status
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">
            كل الحالات
          </option>

          <option value="pending">
            قيد الانتظار
          </option>

          <option value="confirmed">
            مؤكد
          </option>

          <option value="shipped">
            تم الشحن
          </option>

          <option value="delivered">
            تم التوصيل
          </option>

          <option value="cancelled">
            ملغي
          </option>
        </select>

        <button
          type="submit"
          className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          بحث
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[950px] text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="p-4 text-start">
                الرقم
              </th>

              <th className="p-4 text-start">
                العميل
              </th>

              <th className="p-4 text-start">
                الهاتف
              </th>

              <th className="p-4 text-start">
                الولاية
              </th>

              <th className="p-4 text-start">
                التوصيل
              </th>

              <th className="p-4 text-start">
                المجموع
              </th>

              <th className="p-4 text-start">
                الحالة
              </th>

              <th className="p-4 text-start">
                التفاصيل
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length >
            0 ? (
              orders.map(
                (order) => (
                  <tr
                    key={
                      order.id
                    }
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="p-4 font-medium">
                      #
                      {
                        order.order_number
                      }
                    </td>

                    <td className="p-4">
                      {
                        order.customer_name
                      }
                    </td>

                    <td
                      dir="ltr"
                      className="p-4 text-end"
                    >
                      {
                        order.phone
                      }
                    </td>

                    <td className="p-4">
                      {
                        order.wilaya
                      }
                    </td>

                    <td className="p-4">
                      {getDeliveryLabel(
                        order.delivery_type,
                      )}
                    </td>

                    <td className="p-4 font-medium">
                      {formatPrice(
                        order.total ??
                          0,
                      )}
                    </td>

                    <td className="p-4">
                      <StatusBadge
                        status={
                          order.status
                        }
                      />
                    </td>

                    <td className="p-4">
                      <OrderStatusDialog
                        order={
                          order
                        }
                      />
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-muted-foreground"
                >
                  لا توجد طلبات
                  مطابقة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        {page > 1 ? (
          <Link
            href={buildPageHref(
              page - 1,
              {
                search,
                status,
              },
            )}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            السابق
          </Link>
        ) : null}

        <span className="text-sm text-muted-foreground">
          الصفحة {page} من{" "}
          {totalPages}
        </span>

        {page <
        totalPages ? (
          <Link
            href={buildPageHref(
              page + 1,
              {
                search,
                status,
              },
            )}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            التالي
          </Link>
        ) : null}
      </div>
    </section>
  );
}