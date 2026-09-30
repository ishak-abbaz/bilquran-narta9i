"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  formatDZD,
  getSubtotal,
  useCartStore,
} from "@/store/cart";
import { useHydrated } from "@/hooks/use-hydrated";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({
  open,
  onOpenChange,
}: CartDrawerProps) {
  const hydrated = useHydrated();

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore(
    (state) => state.updateQuantity,
  );
  const removeItem = useCartStore(
    (state) => state.removeItem,
  );

  if (!hydrated) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-end">
            سلة التسوق
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">
              السلة فارغة
            </p>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3 border-b pb-4"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1 text-end">
                    <h3 className="font-medium">
                      {item.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      المقاس: {item.size}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      اللون: {item.color}
                    </p>

                    <p className="mt-1">
                      {formatDZD(item.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1,
                          )
                        }
                      >
                        <Plus />
                      </Button>

                      <span className="min-w-8 text-center">
                        {item.quantity}
                      </span>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity - 1,
                          )
                        }
                      >
                        <Minus />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          removeItem(
                            item.productId,
                            item.size,
                            item.color,
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between font-semibold">
                <span>{formatDZD(getSubtotal(items))}</span>
                <span>المجموع</span>
              </div>

              <Button className="w-full" onClick={() => onOpenChange(false)}>
                <Link href="/checkout">
                    إتمام الطلب
                </Link>
               </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}