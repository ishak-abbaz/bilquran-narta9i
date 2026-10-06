import { Settings } from "lucide-react";

import { SettingsTabs } from "@/components/admin/settings-tabs";
import {
  ALGERIA_WILAYAS,
} from "@/lib/algeria-wilayas";
import { requireAdmin } from "@/lib/auth";
import {
  DEFAULT_STORE_SETTINGS,
} from "@/lib/store-settings";
import { createClient } from "@/lib/supabase/server";

type DeliveryPriceRecord = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

function assertCompleteWilayaList() {
  const codes =
    ALGERIA_WILAYAS.map(
      (wilaya) =>
        wilaya.code,
    );

  const uniqueCodes =
    new Set(codes);

  const hasAllCodes =
    Array.from(
      {
        length: 58,
      },
      (
        _,
        index,
      ) =>
        index + 1,
    ).every(
      (code) =>
        uniqueCodes.has(
          code,
        ),
    );

  if (
    ALGERIA_WILAYAS.length !==
      58 ||
    uniqueCodes.size !== 58 ||
    !hasAllCodes
  ) {
    throw new Error(
      "قائمة الولايات يجب أن تحتوي على الولايات الـ58 بالرموز من 1 إلى 58.",
    );
  }
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  assertCompleteWilayaList();

  const supabase =
    await createClient();

  const [
    {
      data: settingsData,
      error: settingsError,
    },
    {
      data: deliveryData,
      error: deliveryError,
    },
  ] = await Promise.all([
    supabase
      .from("settings")
      .select(
        `
          store_name,
          phone,
          email,
          instagram,
          address,
          free_delivery_threshold
        `,
      )
      .eq("id", 1)
      .maybeSingle(),

    supabase
      .from("delivery_prices")
      .select(
        `
          wilaya_code,
          wilaya_name,
          home_price,
          desk_price
        `,
      )
      .order(
        "wilaya_code",
        {
          ascending: true,
        },
      ),
  ]);

  if (settingsError) {
    console.error(
      "فشل تحميل إعدادات المتجر:",
      settingsError,
    );
  }

  if (deliveryError) {
    console.error(
      "فشل تحميل أسعار التوصيل:",
      deliveryError,
    );
  }

  const initialSettings = {
    store_name:
      typeof settingsData?.store_name ===
      "string"
        ? settingsData.store_name
        : DEFAULT_STORE_SETTINGS.store_name,

    phone:
      typeof settingsData?.phone ===
      "string"
        ? settingsData.phone
        : "",

    email:
      typeof settingsData?.email ===
      "string"
        ? settingsData.email
        : "",

    instagram:
      typeof settingsData?.instagram ===
      "string"
        ? settingsData.instagram
        : "",

    address:
      typeof settingsData?.address ===
      "string"
        ? settingsData.address
        : "",

    free_delivery_threshold:
      typeof settingsData?.free_delivery_threshold ===
      "number"
        ? settingsData.free_delivery_threshold
        : null,
  };

  const savedDeliveryPrices =
    (deliveryData ??
      []) as DeliveryPriceRecord[];

  const deliveryMap =
    new Map(
      savedDeliveryPrices.map(
        (row) => [
          row.wilaya_code,
          row,
        ],
      ),
    );

  /*
   * Always render all 58 wilayas.
   * Saved database prices are used when present.
   * Missing rows start at zero and can be saved
   * individually from the editor.
   */
  const initialDeliveryPrices =
    ALGERIA_WILAYAS.map(
      (wilaya) => {
        const saved =
          deliveryMap.get(
            wilaya.code,
          );

        return {
          wilaya_code:
            wilaya.code,

          wilaya_name:
            wilaya.name,

          home_price:
            typeof saved?.home_price ===
            "number"
              ? saved.home_price
              : 0,

          desk_price:
            typeof saved?.desk_price ===
            "number"
              ? saved.desk_price
              : 0,
        };
      },
    );

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="mb-8">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted">
            <Settings
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            إعدادات المتجر
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            الإعدادات
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            إدارة معلومات المتجر وأسعار
            التوصيل لجميع الولايات.
          </p>
        </header>

        <SettingsTabs
          initialSettings={
            initialSettings
          }
          initialDeliveryPrices={
            initialDeliveryPrices
          }
        />
      </div>
    </main>
  );
}