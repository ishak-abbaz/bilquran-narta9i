import Link from "next/link";

import DeleteOrderButton from "@/components/admin/delete-order-button";
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

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const VALID_STATUSES =
  new Set<OrderStatus>([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]);

function getDeliveryLabel(
  deliveryType:
    | string
    | null
    | undefined,
) {
  return deliveryType ===
    "home"
    ? "للمنزل"
    : "للمكتب";
}

function buildPageHref({
  page,
  search,
  status,
}: {
  page: number;
  search: string;
  status: string;
}) {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(page),
  );

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  if (
    status &&
    status !== "all"
  ) {
    params.set(
      "status",
      status,
    );
  }

  return `/admin/orders?${params.toString()}`;
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdmin();

  const params =
    await searchParams;

  const requestedPage =
    Number.parseInt(
      params.page ??
        "1",
      10,
    );

  const page =
    Number.isFinite(
      requestedPage,
    ) &&
    requestedPage >
      0
      ? requestedPage
      : 1;

  const search =
    (
      params.search ??
      ""
    )
      .trim()
      .slice(
        0,
        100,
      );

  const requestedStatus =
    params.status ??
    "all";

  const status =
    requestedStatus ===
      "all" ||
    VALID_STATUSES.has(
      requestedStatus as OrderStatus,
    )
      ? requestedStatus
      : "all";

  const {
    orders,
    totalPages,
  } = await getOrders({
    page,
    search,
    status,
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          الطلبات
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          إدارة طلبات الكتب
          وحالات التوصيل.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          name="search"
          type="search"
          defaultValue={
            search
          }
          placeholder="بحث بالاسم أو الهاتف"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />

        <select
          name="status"
          defaultValue={
            status
          }
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:min-w-40"
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
          className="h-11 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          بحث
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  الرقم
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  العميل
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  الهاتف
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  الولاية
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  التوصيل
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  المجموع
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  الحالة
                </th>

                <th className="px-5 py-4 text-start font-semibold">
                  التفاصيل
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      8
                    }
                    className="px-5 py-16 text-center text-muted-foreground"
                  >
                    لا توجد طلبات
                    مطابقة.
                  </td>
                </tr>
              ) : (
                orders.map(
                  (
                    order,
                  ) => (
                    <tr
                      key={
                        order.id
                      }
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-5 py-4 font-semibold">
                        #
                        {
                          order.order_number
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          order.customer_name
                        }
                      </td>

                      <td
                        dir="ltr"
                        className="px-5 py-4 text-end"
                      >
                        {
                          order.phone
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          order.wilaya
                        }
                      </td>

                      <td className="px-5 py-4">
                        {getDeliveryLabel(
                          order.delivery_type,
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {formatPrice(
                          order.total ??
                            0,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            order.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <OrderStatusDialog
                            order={
                              order
                            }
                          />

                          <DeleteOrderButton
                            orderId={
                              order.id
                            }
                            orderNumber={
                              order.order_number
                            }
                            status={
                              order.status
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-muted-foreground">
          الصفحة{" "}
          {
            page
          }{" "}
          من{" "}
          {
            Math.max(
              totalPages,
              1,
            )
          }
        </p>

        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={buildPageHref({
                page:
                  page -
                  1,

                search,
                status,
              })}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 font-medium transition-colors hover:bg-muted"
            >
              السابق
            </Link>
          ) : null}

          {page <
          totalPages ? (
            <Link
              href={buildPageHref({
                page:
                  page +
                  1,

                search,
                status,
              })}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 font-medium transition-colors hover:bg-muted"
            >
              التالي
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}