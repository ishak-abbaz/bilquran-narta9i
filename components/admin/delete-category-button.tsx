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
  deleteCategory,
} from "@/app/admin/(panel)/categories/actions";
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

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  bookCount: number;
};

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  bookCount,
}: DeleteCategoryButtonProps) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const hasBooks =
    bookCount > 0;

  function handleDelete() {
    if (hasBooks) {
      return;
    }

    setErrorMessage("");

    startTransition(
      async () => {
        const result =
          await deleteCategory(
            categoryId,
          );

        if (
          !result.success
        ) {
          setErrorMessage(
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
      open={open}
      onOpenChange={
        (nextOpen) => {
          if (
            isPending
          ) {
            return;
          }

          setErrorMessage("");

          setOpen(
            nextOpen,
          );
        }
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
        <Trash2
          className="size-4"
          aria-hidden="true"
        />
        حذف
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasBooks
              ? "لا يمكن حذف التصنيف"
              : "حذف التصنيف"}
          </DialogTitle>

          <DialogDescription>
            {hasBooks ? (
              <>
                التصنيف{" "}
                <span className="font-semibold text-foreground">
                  {
                    categoryName
                  }
                </span>{" "}
                يحتوي على{" "}
                <span className="font-semibold text-foreground">
                  {
                    bookCount
                  }
                </span>{" "}
                كتاباً. انقل
                الكتب إلى تصنيف
                آخر قبل الحذف.
              </>
            ) : (
              <>
                هل أنت متأكد من
                حذف{" "}
                <span className="font-semibold text-foreground">
                  {
                    categoryName
                  }
                </span>
                ؟ سيتم أيضاً حذف
                صورة التصنيف من
                التخزين.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
          >
            {
              errorMessage
            }
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={
              isPending
            }
            onClick={() =>
              setOpen(false)
            }
          >
            {hasBooks
              ? "إغلاق"
              : "إلغاء"}
          </Button>

          {!hasBooks ? (
            <Button
              type="button"
              disabled={
                isPending
              }
              onClick={
                handleDelete
              }
            >
              {isPending
                ? "جار الحذف..."
                : "تأكيد الحذف"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}