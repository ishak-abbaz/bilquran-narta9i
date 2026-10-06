"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  updateOrderStatus,
} from "@/app/admin/(panel)/orders/actions";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatPrice,
} from "@/lib/utils";
import type {
  Order,
  OrderItem,
  OrderStatus,
} from "@/types";

import StatusBadge from "./status-badge";

type AdminOrder =
  Order & {
    order_items:
      OrderItem[];
  };

type OrderStatusDialogProps = {
  order: AdminOrder;
};

function getDeliveryLabel(
  deliveryType:
    | "home"
    | "desk",
) {
  return deliveryType ===
    "home"
    ? "توصيل للمنزل"
    : "توصيل للمكتب";
}

function getWhatsAppNumber(
  phone: string,
) {
  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  if (
    digits.startsWith(
      "00213",
    )
  ) {
    return digits.slice(2);
  }

  if (
    digits.startsWith(
      "213",
    )
  ) {
    return digits;
  }

  if (
    digits.startsWith(
      "0",
    )
  ) {
    return `213${digits.slice(
      1,
    )}`;
  }

  return `213${digits}`;
}

export default function OrderStatusDialog({
  order,
}: OrderStatusDialogProps) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState<OrderStatus>(
    order.status,
  );

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    setStatus(
      order.status,
    );
  }, [
    order.id,
    order.status,
  ]);

  const whatsapp =
    `https://wa.me/${getWhatsAppNumber(
      order.phone,
    )}`;

  async function changeStatus(
    value: OrderStatus,
  ) {
    if (
      value === status
    ) {
      return;
    }

    setErrorMessage("");
    setIsUpdating(true);

    const result =
      await updateOrderStatus(
        order.id,
        value,
      );

    if (
      !result.success
    ) {
      setErrorMessage(
        result.message,
      );

      setIsUpdating(
        false,
      );

      return;
    }

    setStatus(value);
    setIsUpdating(false);

    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        setOpen
      }
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
          />
        }
      >
        عرض
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            تفاصيل الطلب #
            {
              order.order_number
            }
          </DialogTitle>

          <DialogDescription>
            معلومات العميل،
            الكتاب، التوصيل
            وحالة الطلب.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer */}
          <section className="rounded-xl border border-border p-4">
            <h3 className="font-semibold">
              معلومات العميل
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              <p>
                الاسم:{" "}
                <span className="font-medium">
                  {
                    order.customer_name
                  }
                </span>
              </p>

              <p>
                الولاية:{" "}
                <span className="font-medium">
                  {
                    order.wilaya
                  }
                </span>
              </p>

              <p>
                نوع التوصيل:{" "}
                <span className="font-medium">
                  {getDeliveryLabel(
                    order.delivery_type,
                  )}
                </span>
              </p>

              {order.delivery_type ===
              "home" ? (
                <p>
                  العنوان:{" "}
                  <span className="font-medium">
                    {
                      order.address
                    }
                  </span>
                </p>
              ) : null}

              {order.notes ? (
                <p>
                  ملاحظات:{" "}
                  <span className="font-medium">
                    {
                      order.notes
                    }
                  </span>
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${order.phone}`}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                اتصال:{" "}
                <span dir="ltr">
                  {
                    order.phone
                  }
                </span>
              </a>

              <a
                href={
                  whatsapp
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                واتساب
              </a>
            </div>
          </section>

          {/* Book */}
          <section className="space-y-3">
            <h3 className="font-semibold">
              الكتاب
            </h3>

            {order.order_items.length >
            0 ? (
              order.order_items.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="font-semibold">
                      {item.product_name ??
                        "كتاب محذوف"}
                    </p>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p className="text-muted-foreground">
                        الكمية:{" "}
                        <span className="font-medium text-foreground">
                          {
                            item.quantity
                          }
                        </span>
                      </p>

                      <p className="text-muted-foreground">
                        سعر الوحدة:{" "}
                        <span className="font-medium text-foreground">
                          {formatPrice(
                            item.unit_price ??
                              0,
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                ),
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                لا توجد بيانات
                للكتاب.
              </p>
            )}
          </section>

          {/* Totals */}
          <section className="space-y-3 rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                المجموع الفرعي
              </span>

              <span className="font-semibold">
                {formatPrice(
                  order.subtotal ??
                    0,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                التوصيل
              </span>

              <span className="font-semibold">
                {order.delivery_fee ===
                0
                  ? "مجاني"
                  : formatPrice(
                      order.delivery_fee ??
                        0,
                    )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                نوع التوصيل
              </span>

              <span className="font-semibold">
                {getDeliveryLabel(
                  order.delivery_type,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <span className="font-bold">
                الإجمالي
              </span>

              <span className="text-lg font-bold text-primary">
                {formatPrice(
                  order.total ??
                    0,
                )}
              </span>
            </div>
          </section>

          {/* Status */}
          <section>
            <label
              htmlFor={`order-status-${order.id}`}
              className="mb-2 block text-sm font-semibold"
            >
              حالة الطلب
            </label>

            <select
              id={`order-status-${order.id}`}
              value={status}
              disabled={
                isUpdating
              }
              onChange={(
                event,
              ) =>
                changeStatus(
                  event.target
                    .value as OrderStatus,
                )
              }
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
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

            <div className="mt-3">
              <StatusBadge
                status={
                  status
                }
              />
            </div>

            {isUpdating ? (
              <p className="mt-3 text-sm text-muted-foreground">
                جار تحديث حالة
                الطلب...
              </p>
            ) : null}

            {errorMessage ? (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
              >
                {
                  errorMessage
                }
              </p>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}