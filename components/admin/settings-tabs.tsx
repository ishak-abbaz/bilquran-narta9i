"use client";

import {
  MapPin,
  Save,
  Settings,
  Truck,
} from "lucide-react";
import {
  FormEvent,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  saveDeliveryPrice,
  saveStoreSettings,
} from "@/app/admin/(panel)/settings/actions";

type StoreSettingsData = {
  store_name: string;
  phone: string;
  email: string;
  instagram: string;
  address: string;
  free_delivery_threshold: number | null;
};

export type DeliveryPriceRow = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

type SettingsTabsProps = {
  initialSettings: StoreSettingsData;
  initialDeliveryPrices: DeliveryPriceRow[];
};

type TabName = "store" | "delivery";

function inputClassName() {
  return "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/20";
}

export function SettingsTabs({
  initialSettings,
  initialDeliveryPrices,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] =
    useState<TabName>("store");

  const [
    storeSettings,
    setStoreSettings,
  ] = useState({
    store_name:
      initialSettings.store_name,
    phone: initialSettings.phone,
    email: initialSettings.email,
    instagram:
      initialSettings.instagram,
    address: initialSettings.address,
    free_delivery_threshold:
      initialSettings.free_delivery_threshold ===
      null
        ? ""
        : String(
            initialSettings.free_delivery_threshold,
          ),
  });

  const [
    deliveryPrices,
    setDeliveryPrices,
  ] = useState<DeliveryPriceRow[]>(
    initialDeliveryPrices,
  );

  const [
    isStorePending,
    startStoreTransition,
  ] = useTransition();

  const [
    isDeliveryPending,
    startDeliveryTransition,
  ] = useTransition();

  const [
    savingWilayaCode,
    setSavingWilayaCode,
  ] = useState<number | null>(null);

  function handleStoreSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    startStoreTransition(async () => {
      const threshold =
        storeSettings.free_delivery_threshold.trim() ===
        ""
          ? null
          : Number(
              storeSettings.free_delivery_threshold,
            );

      const result =
        await saveStoreSettings({
          store_name:
            storeSettings.store_name,
          phone: storeSettings.phone,
          email: storeSettings.email,
          instagram:
            storeSettings.instagram,
          address:
            storeSettings.address,
          free_delivery_threshold:
            threshold,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  }

  function updateDeliveryPrice(
    wilayaCode: number,
    field:
      | "home_price"
      | "desk_price",
    value: string,
  ) {
    const numericValue =
      value === ""
        ? 0
        : Math.max(
            0,
            Number(value) || 0,
          );

    setDeliveryPrices(
      (current) =>
        current.map((row) =>
          row.wilaya_code ===
          wilayaCode
            ? {
                ...row,
                [field]:
                  numericValue,
              }
            : row,
        ),
    );
  }

  function handleSaveWilaya(
    row: DeliveryPriceRow,
  ) {
    setSavingWilayaCode(
      row.wilaya_code,
    );

    startDeliveryTransition(
      async () => {
        try {
          const result =
            await saveDeliveryPrice({
              wilaya_code:
                row.wilaya_code,
              home_price:
                row.home_price,
              desk_price:
                row.desk_price,
            });

          if (!result.success) {
            toast.error(
              result.message,
            );

            return;
          }

          toast.success(
            result.message,
          );
        } finally {
          setSavingWilayaCode(
            null,
          );
        }
      },
    );
  }

  return (
    <div>
      <div className="mb-6 inline-flex rounded-xl border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() =>
            setActiveTab("store")
          }
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
            activeTab === "store"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings
            className="size-4"
            aria-hidden="true"
          />
          معلومات المتجر
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "delivery",
            )
          }
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
            activeTab ===
            "delivery"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck
            className="size-4"
            aria-hidden="true"
          />
          أسعار التوصيل
        </button>
      </div>

      {activeTab === "store" ? (
        <form
          onSubmit={
            handleStoreSubmit
          }
          className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold">
              معلومات المتجر
            </h2>

            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              هذه المعلومات تظهر في
              واجهة المتجر وصفحة
              التواصل.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="store-name"
                className="mb-2 block text-sm font-semibold"
              >
                اسم المتجر
              </label>

              <input
                id="store-name"
                value={
                  storeSettings.store_name
                }
                onChange={(
                  event,
                ) =>
                  setStoreSettings(
                    (current) => ({
                      ...current,
                      store_name:
                        event.target
                          .value,
                    }),
                  )
                }
                className={inputClassName()}
              />
            </div>

            <div>
              <label
                htmlFor="store-phone"
                className="mb-2 block text-sm font-semibold"
              >
                رقم الهاتف
              </label>

              <input
                id="store-phone"
                type="tel"
                dir="ltr"
                value={
                  storeSettings.phone
                }
                onChange={(
                  event,
                ) =>
                  setStoreSettings(
                    (current) => ({
                      ...current,
                      phone:
                        event.target
                          .value,
                    }),
                  )
                }
                className={`${inputClassName()} text-end`}
              />
            </div>

            <div>
              <label
                htmlFor="store-email"
                className="mb-2 block text-sm font-semibold"
              >
                البريد الإلكتروني
              </label>

              <input
                id="store-email"
                type="email"
                dir="ltr"
                value={
                  storeSettings.email
                }
                onChange={(
                  event,
                ) =>
                  setStoreSettings(
                    (current) => ({
                      ...current,
                      email:
                        event.target
                          .value,
                    }),
                  )
                }
                className={`${inputClassName()} text-end`}
              />
            </div>

            <div>
              <label
                htmlFor="store-instagram"
                className="mb-2 block text-sm font-semibold"
              >
                إنستغرام
              </label>

              <input
                id="store-instagram"
                dir="ltr"
                placeholder="@username"
                value={
                  storeSettings.instagram
                }
                onChange={(
                  event,
                ) =>
                  setStoreSettings(
                    (current) => ({
                      ...current,
                      instagram:
                        event.target
                          .value,
                    }),
                  )
                }
                className={`${inputClassName()} text-end`}
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="store-address"
                className="mb-2 block text-sm font-semibold"
              >
                العنوان
              </label>

              <textarea
                id="store-address"
                rows={4}
                value={
                  storeSettings.address
                }
                onChange={(
                  event,
                ) =>
                  setStoreSettings(
                    (current) => ({
                      ...current,
                      address:
                        event.target
                          .value,
                    }),
                  )
                }
                className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-7 outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label
                htmlFor="free-delivery-threshold"
                className="mb-2 block text-sm font-semibold"
              >
                حد التوصيل المجاني
              </label>

              <div className="relative">
                <input
                  id="free-delivery-threshold"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="اتركه فارغاً لتعطيله"
                  value={
                    storeSettings.free_delivery_threshold
                  }
                  onChange={(
                    event,
                  ) =>
                    setStoreSettings(
                      (current) => ({
                        ...current,
                        free_delivery_threshold:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className={`${inputClassName()} pe-16`}
                />

                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  د.ج
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              disabled={
                isStorePending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-50"
            >
              <Save
                className="size-4"
                aria-hidden="true"
              />

              {isStorePending
                ? "جار الحفظ..."
                : "حفظ المعلومات"}
            </button>
          </div>
        </form>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <MapPin
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  أسعار التوصيل
                </h2>

                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  عدّل سعر التوصيل إلى
                  المنزل والمكتب لكل
                  ولاية ثم احفظ الصف.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-20 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                    الرمز
                  </th>

                  <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                    الولاية
                  </th>

                  <th className="w-52 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                    إلى المنزل
                  </th>

                  <th className="w-52 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                    إلى المكتب
                  </th>

                  <th className="w-32 px-5 py-4 text-end text-xs font-semibold text-muted-foreground">
                    حفظ
                  </th>
                </tr>
              </thead>

              <tbody>
                {deliveryPrices.map(
                  (row) => {
                    const isSaving =
                      isDeliveryPending &&
                      savingWilayaCode ===
                        row.wilaya_code;

                    return (
                      <tr
                        key={
                          row.wilaya_code
                        }
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-3 font-medium tabular-nums">
                          {String(
                            row.wilaya_code,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </td>

                        <td className="px-5 py-3 font-semibold">
                          {
                            row.wilaya_name
                          }
                        </td>

                        <td className="px-5 py-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={
                                row.home_price
                              }
                              onChange={(
                                event,
                              ) =>
                                updateDeliveryPrice(
                                  row.wilaya_code,
                                  "home_price",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="h-10 w-full rounded-lg border border-input bg-background ps-3 pe-14 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                            />

                            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              د.ج
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={
                                row.desk_price
                              }
                              onChange={(
                                event,
                              ) =>
                                updateDeliveryPrice(
                                  row.wilaya_code,
                                  "desk_price",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="h-10 w-full rounded-lg border border-input bg-background ps-3 pe-14 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                            />

                            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              د.ج
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={
                                isDeliveryPending
                              }
                              onClick={() =>
                                handleSaveWilaya(
                                  row,
                                )
                              }
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                            >
                              <Save
                                className="size-4"
                                aria-hidden="true"
                              />

                              {isSaving
                                ? "جار الحفظ..."
                                : "حفظ"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}