"use client";

import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  toast,
} from "sonner";

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

  order_number:
    | number
    | string;

  customer_name: string;
  phone: string;
  wilaya: string;

  delivery_type:
    DeliveryType;

  address: string;

  notes:
    | string
    | null;

  status:
    OrderStatus;

  subtotal:
    | number
    | null;

  delivery_fee:
    | number
    | null;

  total:
    | number
    | null;

  order_items:
    OrderItem[];
};

type OrderStatusDialogProps = {
  order:
    OrderData;
};

const STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
}> = [
  {
    value:
      "pending",
    label:
      "قيد الانتظار",
  },
  {
    value:
      "confirmed",
    label:
      "مؤكد",
  },
  {
    value:
      "shipped",
    label:
      "تم الشحن",
  },
  {
    value:
      "delivered",
    label:
      "تم التوصيل",
  },
  {
    value:
      "cancelled",
    label:
      "ملغي",
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

  const whatsappUrl =
    `https://wa.me/${getWhatsAppNumber(
      order.phone,
    )}`;

  async function changeStatus(
    nextStatus:
      OrderStatus,
  ) {
    if (
      nextStatus ===
      status
    ) {
      return;
    }

    setIsUpdating(
      true,
    );

    try {
      const result =
        await updateOrderStatus(
          order.id,
          nextStatus,
        );

      if (
        !result.success
      ) {
        toast.error(
          result.message,
        );

        return;
      }

      setStatus(
        nextStatus,
      );

      toast.success(
        "تم تحديث حالة الطلب.",
      );

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "فشل تحديث حالة الطلب:",
        error,
      );

      toast.error(
        "تعذر تحديث حالة الطلب.",
      );
    } finally {
      setIsUpdating(
        false,
      );
    }
  }

  return (
    <Dialog
      open={
        open
      }
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
            تفاصيل العميل
            والكتاب وحالة الطلب.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-xl border border-border p-4">
            <div className="grid gap-3 text-sm">
              <p>
                <span className="text-muted-foreground">
                  العميل:{" "}
                </span>

                {
                  order.customer_name
                }
              </p>

              <p>
                <span className="text-muted-foreground">
                  الولاية:{" "}
                </span>

                {
                  order.wilaya
                }
              </p>

              <p>
                <span className="text-muted-foreground">
                  التوصيل:{" "}
                </span>

                {order.delivery_type ===
                "home"
                  ? "للمنزل"
                  : "للمكتب"}
              </p>

              {order.delivery_type ===
              "home" ? (
                <p>
                  <span className="text-muted-foreground">
                    العنوان:{" "}
                  </span>

                  {
                    order.address
                  }
                </p>
              ) : null}

              {order.notes ? (
                <p>
                  <span className="text-muted-foreground">
                    ملاحظات:{" "}
                  </span>

                  {
                    order.notes
                  }
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
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
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">
              الكتب
            </h3>

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

                  <div className="mt-2 flex justify-between gap-4 text-sm text-muted-foreground">
                    <span>
                      الكمية:{" "}
                      {
                        item.quantity
                      }
                    </span>

                    <span>
                      {formatPrice(
                        item.unit_price ??
                          0,
                      )}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="space-y-3 rounded-xl bg-muted p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span>
                المجموع الفرعي
              </span>

              <strong>
                {formatPrice(
                  order.subtotal ??
                    0,
                )}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>
                التوصيل
              </span>

              <strong>
                {order.delivery_fee ===
                0
                  ? "مجاني"
                  : formatPrice(
                      order.delivery_fee ??
                        0,
                    )}
              </strong>
            </div>

            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <span className="font-bold">
                الإجمالي
              </span>

              <strong>
                {formatPrice(
                  order.total ??
                    0,
                )}
              </strong>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">
                حالة الطلب
              </h3>

              <StatusBadge
                status={
                  status
                }
              />
            </div>

            <select
              value={
                status
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
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}