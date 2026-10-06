"use client";

import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  updateOrderStatus,
} from "@/app/admin/(panel)/orders/actions";
import StatusBadge from "@/components/admin/status-badge";
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

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type DeliveryType =
  | "home"
  | "desk";

type OrderItem = {
  id: string;
  product_name:
    | string
    | null;
  unit_price:
    | number
    | null;
  quantity: number;
};

type OrderData = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  wilaya: string;
  delivery_type: DeliveryType;
  address: string;
  notes:
    | string
    | null;
  status: OrderStatus;
  subtotal:
    | number
    | null;
  delivery_fee:
    | number
    | null;
  total:
    | number
    | null;
  order_items: OrderItem[];
};

type OrderStatusDialogProps = {
  order: OrderData;
};

const STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
}> = [
  {
    value: "pending",
    label: "قيد الانتظار",
  },
  {
    value: "confirmed",
    label: "مؤكد",
  },
  {
    value: "shipped",
    label: "تم الشحن",
  },
  {
    value: "delivered",
    label: "تم التوصيل",
  },
  {
    value: "cancelled",
    label: "ملغي",
  },
];

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
    return digits.slice(
      2,
    );
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

function getDeliveryLabel(
  deliveryType:
    DeliveryType,
) {
  return deliveryType ===
    "home"
    ? "التوصيل إلى المنزل"
    : "التوصيل إلى المكتب";
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
    pendingStatus,
    setPendingStatus,
  ] = useState<
    OrderStatus | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const displayedStatus =
    pendingStatus ??
    order.status;

  const whatsappUrl =
    `https://wa.me/${getWhatsAppNumber(
      order.phone,
    )}`;

  async function changeStatus(
    value: OrderStatus,
  ) {
    if (
      value ===
      displayedStatus
    ) {
      return;
    }

    setErrorMessage("");
    setPendingStatus(
      value,
    );
    setIsUpdating(
      true,
    );

    try {
      const result =
        await updateOrderStatus(
          order.id,
          value,
        );

      if (
        !result.success
      ) {
        setPendingStatus(
          null,
        );

        setErrorMessage(
          result.message,
        );

        return;
      }

      setOpen(false);
      setPendingStatus(
        null,
      );

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "فشل تحديث حالة الطلب:",
        error,
      );

      setPendingStatus(
        null,
      );

      setErrorMessage(
        "تعذر تحديث حالة الطلب. حاول مرة أخرى.",
      );
    } finally {
      setIsUpdating(
        false,
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(
        nextOpen,
      ) => {
        if (
          isUpdating
        ) {
          return;
        }

        setErrorMessage("");

        if (
          !nextOpen
        ) {
          setPendingStatus(
            null,
          );
        }

        setOpen(
          nextOpen,
        );
      }}
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
            معلومات العميل
            والكتاب وحالة الطلب.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3 rounded-xl border border-border p-4">
            <h3 className="font-semibold">
              العميل
            </h3>

            <dl className="grid gap-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  الاسم
                </dt>

                <dd className="text-end font-medium">
                  {
                    order.customer_name
                  }
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  الولاية
                </dt>

                <dd className="text-end font-medium">
                  {
                    order.wilaya
                  }
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  نوع التوصيل
                </dt>

                <dd className="text-end font-medium">
                  {getDeliveryLabel(
                    order.delivery_type,
                  )}
                </dd>
              </div>

              {order.delivery_type ===
              "home" ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">
                    العنوان
                  </dt>

                  <dd className="max-w-xs text-end font-medium">
                    {
                      order.address
                    }
                  </dd>
                </div>
              ) : null}

              {order.notes ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">
                    ملاحظات
                  </dt>

                  <dd className="max-w-xs whitespace-pre-wrap text-end font-medium">
                    {
                      order.notes
                    }
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                render={
                  <a
                    href={`tel:${order.phone}`}
                  />
                }
              >
                اتصال
              </Button>

              <Button
                type="button"
                variant="outline"
                render={
                  <a
                    href={
                      whatsappUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                واتساب
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">
              الكتب
            </h3>

            <div className="space-y-3">
              {order.order_items.map(
                (
                  item,
                ) => (
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

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          الكمية
                        </p>

                        <p className="mt-1 font-medium">
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          سعر الوحدة
                        </p>

                        <p className="mt-1 font-medium">
                          {formatPrice(
                            item.unit_price ??
                              0,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-xl bg-muted p-4 text-sm">
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

            <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-base">
              <span className="font-bold">
                الإجمالي
              </span>

              <span className="font-bold">
                {formatPrice(
                  order.total ??
                    0,
                )}
              </span>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">
                حالة الطلب
              </h3>

              <StatusBadge
                status={
                  displayedStatus
                }
              />
            </div>

            <select
              value={
                displayedStatus
              }
              disabled={
                isUpdating
              }
              onChange={(
                event,
              ) => {
                void changeStatus(
                  event.target
                    .value as OrderStatus,
                );
              }}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {STATUS_OPTIONS.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>

            {isUpdating ? (
              <p className="text-xs text-muted-foreground">
                جار تحديث حالة
                الطلب...
              </p>
            ) : null}

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
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