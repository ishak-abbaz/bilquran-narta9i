"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type OrderSuccessClientProps = {
  orderNumber: string;
};

export function OrderSuccessClient({
  orderNumber,
}: OrderSuccessClientProps) {
  const router = useRouter();

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold">
        شكراً لك على طلبك
      </h1>

      <p className="mt-4 leading-7 text-muted-foreground">
        تم استلام طلبك بنجاح. سنتصل بك هاتفياً
        لتأكيد الطلب قبل الشحن.
      </p>

      <div className="mt-6 rounded-xl bg-muted p-5">
        <p className="text-sm text-muted-foreground">
          رقم الطلب
        </p>

        <p
          dir="ltr"
          className="mt-2 text-2xl font-bold"
        >
          {orderNumber}
        </p>
      </div>

      <Button
        type="button"
        className="mt-8 w-full"
        onClick={() =>
          router.push("/shop")
        }
      >
        العودة إلى المتجر
      </Button>
    </div>
  );
}