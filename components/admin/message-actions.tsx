"use client";

import {
  Eye,
  Phone,
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
  deleteContactMessage,
} from "@/app/admin/(panel)/messages/actions";
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

type MessageActionsProps = {
  message: {
    id: string;
    name: string;
    phone: string;
    message: string;
  };

  createdAtLabel: string;
};

export default function MessageActions({
  message,
  createdAtLabel,
}: MessageActionsProps) {
  const router =
    useRouter();

  const [
    viewOpen,
    setViewOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleDelete() {
    startTransition(
      async () => {
        const result =
          await deleteContactMessage(
            message.id,
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

        setDeleteOpen(
          false,
        );

        setViewOpen(
          false,
        );

        router.refresh();
      },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog
        open={
          viewOpen
        }
        onOpenChange={
          setViewOpen
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
          <Eye
            className="size-4"
            aria-hidden="true"
          />

          عرض
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              رسالة من{" "}
              {
                message.name
              }
            </DialogTitle>

            <DialogDescription>
              {
                createdAtLabel
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 rounded-xl border border-border p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">
                  الاسم
                </span>

                <span className="font-semibold">
                  {
                    message.name
                  }
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">
                  الهاتف
                </span>

                <a
                  href={`tel:${message.phone}`}
                  dir="ltr"
                  className="font-semibold transition-colors hover:text-primary"
                >
                  {
                    message.phone
                  }
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">
                محتوى الرسالة
              </h3>

              <div className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/30 p-4 text-sm leading-8">
                {
                  message.message
                }
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              render={
                <a
                  href={`tel:${message.phone}`}
                />
              }
            >
              <Phone
                className="size-4"
                aria-hidden="true"
              />

              اتصال
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={
          deleteOpen
        }
        onOpenChange={(
          nextOpen,
        ) => {
          if (
            !isPending
          ) {
            setDeleteOpen(
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
              حذف الرسالة
            </DialogTitle>

            <DialogDescription>
              سيتم حذف رسالة{" "}
              {
                message.name
              }{" "}
              نهائياً.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
            لا يمكن التراجع عن حذف
            هذه الرسالة.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                isPending
              }
              onClick={() =>
                setDeleteOpen(
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
    </div>
  );
}