"use client";

import {
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useTransition,
} from "react";
import {
  toast,
} from "sonner";

import {
  moveCategory,
} from "@/app/admin/(panel)/categories/actions";
import {
  Button,
} from "@/components/ui/button";

type CategorySortButtonsProps = {
  categoryId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export default function CategorySortButtons({
  categoryId,
  canMoveUp,
  canMoveDown,
}: CategorySortButtonsProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function move(
    direction:
      | "up"
      | "down",
  ) {
    startTransition(
      async () => {
        const result =
          await moveCategory(
            categoryId,
            direction,
          );

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        router.refresh();
      },
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={
          isPending ||
          !canMoveUp
        }
        aria-label="تحريك التصنيف للأعلى"
        onClick={() =>
          move("up")
        }
      >
        <ArrowUp
          className="size-4"
          aria-hidden="true"
        />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={
          isPending ||
          !canMoveDown
        }
        aria-label="تحريك التصنيف للأسفل"
        onClick={() =>
          move("down")
        }
      >
        <ArrowDown
          className="size-4"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}