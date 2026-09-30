"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";

export function OrderSuccessClient() {
  const router = useRouter();

  const clear = useCartStore(
    (state) => state.clear,
  );

  useEffect(() => {
    clear();
  }, [clear]);


  return (
    <div className="flex flex-col gap-3 sm:flex-row">

      <Button
        className="flex-1"
        onClick={() => router.push("/shop")}
      >
        متابعة التسوق
      </Button>


      <Button
        variant="outline"
        className="flex-1"
        onClick={() => router.push("/")}
      >
        الصفحة الرئيسية
      </Button>

    </div>
  );
}