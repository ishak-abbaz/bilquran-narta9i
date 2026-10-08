import {
  MapPin,
} from "lucide-react";

import {
  SettingsTabs,
} from "@/components/admin/settings-tabs";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

type DeliveryPriceRecord = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "delivery_prices",
    )
    .select(`
      wilaya_code,
      wilaya_name,
      home_price,
      desk_price
    `)
    .order(
      "wilaya_code",
      {
        ascending:
          true,
      },
    );

  if (error) {
    console.error(
      "فشل تحميل ولايات التوصيل:",
      error,
    );

    throw new Error(
      "تعذر تحميل ولايات التوصيل.",
    );
  }

  const deliveryPrices =
    (
      data ??
      []
    ) as DeliveryPriceRecord[];

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="mb-8">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            إعدادات التوصيل
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ولايات التوصيل
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            أضف أي عدد من الولايات
            وعدّل الاسم والرمز وأسعار
            التوصيل إلى المنزل
            والمكتب.
          </p>
        </header>

        <SettingsTabs
          initialDeliveryPrices={
            deliveryPrices
          }
        />
      </div>
    </main>
  );
}