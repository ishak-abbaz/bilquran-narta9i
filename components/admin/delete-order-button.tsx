"use client";

import {
  Trash2,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
  useTransition,
} from "react";
import {
  toast,
} from "sonner";

import {
  deleteOrder,
} from "@/app/admin/(panel)/orders/actions";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type DeleteOrderButtonProps = {
  orderId: string;

  orderNumber:
    | number
    | string;

  status:
    OrderStatus;
};

function getWarning(
  status: OrderStatus,
) {
  switch (
    status
  ) {
    case "pending":
    case "confirmed":
    case "shipped":
      return "سيتم حذف الطلب نهائياً وإرجاع كمياته إلى المخزون تلقائياً.";

    case "delivered":
      return "هذا الطلب مكتمل. سيتم حذفه نهائياً من سجل الطلبات والمبيعات، ولن تتم إعادة الكمية إلى المخزون.";

    case "cancelled":
      return "سيتم حذف الطلب الملغي نهائياً. الكمية تمت إعادتها إلى المخزون عند إلغاء الطلب.";

    default:
      return "سيتم حذف الطلب نهائياً.";
  }
}

export default function DeleteOrderButton({
  orderId,
  orderNumber,
  status,
}: DeleteOrderButtonProps) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleDelete() {
    startTransition(
      async () => {
        const result =
          await deleteOrder(
            orderId,
          );

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        setOpen(false);

        router.refresh();
      },
    );
  }

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={(
        nextOpen,
      ) => {
        if (
          !isPending
        ) {
          setOpen(
            nextOpen,
          );
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2
          className="size-4"
          aria-hidden="true"
        />

        حذف
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            حذف الطلب #
            {
              orderNumber
            }
          </DialogTitle>

          <DialogDescription>
            هذه العملية دائمة
            ولا يمكن التراجع عنها.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
          {getWarning(
            status,
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              isPending
            }
            onClick={() =>
              setOpen(
                false,
              )
            }
          >
            تراجع
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={
              isPending
            }
            onClick={
              handleDelete
            }
          >
            {isPending
              ? "جار الحذف..."
              : "حذف نهائياً"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}