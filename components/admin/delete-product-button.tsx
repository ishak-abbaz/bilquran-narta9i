"use client";

import {
  Trash2,
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useRef,
  useTransition,
} from "react";
import {
  toast,
} from "sonner";

import {
  deleteProduct,
} from "@/app/admin/(panel)/products/actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const dialogRef =
    useRef<HTMLDialogElement>(
      null,
    );

  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (isPending) {
      return;
    }

    dialogRef.current?.close();
  }

  function handleDelete() {
    startTransition(
      async () => {
        const result =
          await deleteProduct(
            productId,
          );

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        dialogRef.current?.close();

        toast.success(
          result.message,
        );

        router.refresh();
      },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={
          openDialog
        }
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2
          className="size-4"
          aria-hidden="true"
        />
        حذف
      </button>

      <dialog
        ref={
          dialogRef
        }
        aria-labelledby={`delete-book-title-${productId}`}
        aria-describedby={`delete-book-description-${productId}`}
        onCancel={(
          event,
        ) => {
          if (
            isPending
          ) {
            event.preventDefault();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/60 dark:bg-card"
      >
        <div className="relative p-6">
          <button
            type="button"
            onClick={
              closeDialog
            }
            disabled={
              isPending
            }
            aria-label="إغلاق"
            className="absolute end-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X
              className="size-4"
              aria-hidden="true"
            />
          </button>

          <div className="pe-10">
            <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-muted">
              <Trash2
                className="size-5"
                aria-hidden="true"
              />
            </div>

            <h2
              id={`delete-book-title-${productId}`}
              className="text-lg font-bold tracking-tight"
            >
              حذف الكتاب
            </h2>

            <p
              id={`delete-book-description-${productId}`}
              className="mt-2 text-sm leading-7 text-muted-foreground"
            >
              هل أنت متأكد من حذف
              الكتاب{" "}
              <span className="font-semibold text-foreground">
                {
                  productName
                }
              </span>
              ؟ لا يمكن التراجع عن
              هذه العملية.
            </p>

            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              الطلبات السابقة تحتفظ
              باسم الكتاب حتى بعد
              حذفه.
            </p>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                closeDialog
              }
              disabled={
                isPending
              }
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={
                handleDelete
              }
              disabled={
                isPending
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  />
                  جار الحذف...
                </>
              ) : (
                <>
                  <Trash2
                    className="size-4"
                    aria-hidden="true"
                  />
                  تأكيد الحذف
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}