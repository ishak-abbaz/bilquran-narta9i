"use client";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  Check,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import {
  useForm,
  useWatch,
} from "react-hook-form";
import {
  toast,
} from "sonner";

import {
  createOrderAction,
} from "@/app/(store)/product/[slug]/actions";
import {
  formatPrice,
} from "@/lib/utils";
import {
  orderSchema,
  type OrderInput,
} from "@/lib/validation/order";
import type {
  Product,
} from "@/types";

type DeliveryPrice = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

type OrderFormProps = {
  book: Product;
  deliveryPrices: DeliveryPrice[];
};

const QUANTITY_OPTIONS = [
  1,
  2,
  3,
] as const;

function fieldClassName(
  hasError: boolean,
) {
  return [
    "h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition",
    "placeholder:text-muted-foreground",
    "focus:ring-2 focus:ring-primary/15",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-primary",
  ].join(" ");
}

function quantityLabel(
  quantity: number,
) {
  if (quantity === 1) {
    return "نسخة واحدة";
  }

  if (quantity === 2) {
    return "نسختان";
  }

  return "3 نسخ";
}

export default function OrderForm({
  book,
  deliveryPrices,
}: OrderFormProps) {
  const safeDeliveryPrices =
    Array.isArray(
      deliveryPrices,
    )
      ? deliveryPrices
      : [];

  const firstWilayaCode =
    safeDeliveryPrices[
      0
    ]?.wilaya_code ??
    0;

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<OrderInput>({
      resolver:
        zodResolver(
          orderSchema,
        ),

      defaultValues: {
        productId:
          book.id,

        quantity: 1,

        fullName: "",

        phone: "",

        wilayaCode:
          firstWilayaCode,

        deliveryType:
          "home",

        address: "",

        notes: "",
      },
    });

  const quantity =
    useWatch({
      control,
      name: "quantity",
    }) ?? 1;

  const wilayaCode =
    useWatch({
      control,
      name: "wilayaCode",
    }) ??
    firstWilayaCode;

  const deliveryType =
    useWatch({
      control,
      name: "deliveryType",
    }) ??
    "home";

  const selectedWilaya =
    safeDeliveryPrices.find(
      (
        wilaya,
      ) =>
        wilaya.wilaya_code ===
        Number(
          wilayaCode,
        ),
    );

  const subtotal =
    book.price *
    quantity;

  const deliveryFee =
    selectedWilaya
      ? deliveryType ===
        "home"
        ? selectedWilaya.home_price
        : selectedWilaya.desk_price
      : 0;

  const total =
    subtotal +
    deliveryFee;

  async function onSubmit(
    values: OrderInput,
  ) {
    const result =
      await createOrderAction(
        values,
      );

    if (
      result &&
      result.success ===
        false
    ) {
      toast.error(
        result.message,
      );
    }
  }

  if (
    safeDeliveryPrices.length ===
    0
  ) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm leading-7 text-destructive"
      >
        التوصيل غير متوفر حالياً.
        يرجى المحاولة لاحقاً.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
      <form
        onSubmit={(
          event,
        ) => {
          void handleSubmit(
            onSubmit,
          )(event);
        }}
      >
        <input
          type="hidden"
          {...register(
            "productId",
          )}
        />

        <div className="border-b border-border p-5 sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-primary">
              اختر الكمية
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              اختر عدد النسخ
            </h2>
          </div>

          <div className="grid gap-3">
            {QUANTITY_OPTIONS.map(
              (
                option,
              ) => {
                const selected =
                  quantity ===
                  option;

                const available =
                  book.stock >=
                  option;

                return (
                  <button
                    key={
                      option
                    }
                    type="button"
                    disabled={
                      !available
                    }
                    onClick={() =>
                      setValue(
                        "quantity",
                        option,
                        {
                          shouldDirty:
                            true,

                          shouldValidate:
                            true,
                        },
                      )
                    }
                    className={`relative flex min-h-24 w-full items-center justify-between gap-5 rounded-2xl border-2 px-5 py-4 text-start transition ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                    } ${
                      !available
                        ? "cursor-not-allowed opacity-40"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? (
                          <Check className="size-4" />
                        ) : null}
                      </span>

                      <div>
                        <p className="text-base font-bold sm:text-lg">
                          {quantityLabel(
                            option,
                          )}
                        </p>

                        {!available ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            الكمية غير
                            متوفرة
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-end">
                      <p className="text-lg font-bold tabular-nums sm:text-xl">
                        {formatPrice(
                          book.price *
                            option,
                        )}
                      </p>

                      {option >
                      1 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatPrice(
                            book.price,
                          )}{" "}
                          × {option}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {errors.quantity ? (
            <p className="mt-3 text-xs font-medium text-destructive">
              {
                errors.quantity
                  .message
              }
            </p>
          ) : null}
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">
              املأ استمارة الطلب
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              الدفع عند الاستلام
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="order-full-name"
                className="mb-2 block text-sm font-semibold"
              >
                الاسم واللقب
              </label>

              <div className="relative">
                <User
                  className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="order-full-name"
                  type="text"
                  autoComplete="name"
                  placeholder="الاسم واللقب"
                  className={`${fieldClassName(
                    Boolean(
                      errors.fullName,
                    ),
                  )} ps-12`}
                  {...register(
                    "fullName",
                  )}
                />
              </div>

              {errors.fullName ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {
                    errors
                      .fullName
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="order-phone"
                className="mb-2 block text-sm font-semibold"
              >
                رقم الهاتف
              </label>

              <div
                dir="ltr"
                className="relative"
              >
                <Phone
                  className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="order-phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="05XXXXXXXX"
                  className={`${fieldClassName(
                    Boolean(
                      errors.phone,
                    ),
                  )} pe-12 text-end`}
                  {...register(
                    "phone",
                  )}
                />
              </div>

              {errors.phone ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {
                    errors.phone
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="order-wilaya"
                className="mb-2 block text-sm font-semibold"
              >
                الولاية
              </label>

              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <select
                  id="order-wilaya"
                  className={`${fieldClassName(
                    Boolean(
                      errors.wilayaCode,
                    ),
                  )} ps-12`}
                  {...register(
                    "wilayaCode",
                    {
                      valueAsNumber:
                        true,
                    },
                  )}
                >
                  {safeDeliveryPrices.map(
                    (
                      wilaya,
                    ) => (
                      <option
                        key={
                          wilaya.wilaya_code
                        }
                        value={
                          wilaya.wilaya_code
                        }
                      >
                        {
                          wilaya.wilaya_name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              {errors.wilayaCode ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {
                    errors
                      .wilayaCode
                      .message
                  }
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="mt-7">
            <legend className="mb-4 text-lg font-bold">
              مكان التوصيل
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 p-4 transition ${
                  deliveryType ===
                  "home"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="home"
                    className="size-5 accent-primary"
                    {...register(
                      "deliveryType",
                    )}
                  />

                  <div>
                    <p className="font-bold">
                      للمنزل
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      التوصيل إلى
                      عنوانك
                    </p>
                  </div>
                </div>

                <p className="font-bold">
                  {selectedWilaya
                    ? formatPrice(
                        selectedWilaya.home_price,
                      )
                    : ""}
                </p>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 p-4 transition ${
                  deliveryType ===
                  "desk"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="desk"
                    className="size-5 accent-primary"
                    {...register(
                      "deliveryType",
                    )}
                  />

                  <div>
                    <p className="font-bold">
                      لمكتب التوصيل
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      الاستلام من
                      المكتب
                    </p>
                  </div>
                </div>

                <p className="font-bold">
                  {selectedWilaya
                    ? formatPrice(
                        selectedWilaya.desk_price,
                      )
                    : ""}
                </p>
              </label>
            </div>

            {errors.deliveryType ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {
                  errors
                    .deliveryType
                    .message
                }
              </p>
            ) : null}
          </fieldset>

          {deliveryType ===
          "home" ? (
            <div className="mt-5">
              <label
                htmlFor="order-address"
                className="mb-2 block text-sm font-semibold"
              >
                العنوان
              </label>

              <input
                id="order-address"
                type="text"
                autoComplete="street-address"
                placeholder="البلدية، الحي، الشارع..."
                className={
                  fieldClassName(
                    Boolean(
                      errors.address,
                    ),
                  )
                }
                {...register(
                  "address",
                )}
              />

              {errors.address ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  {
                    errors.address
                      .message
                  }
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5">
            <label
              htmlFor="order-notes"
              className="mb-2 block text-sm font-semibold"
            >
              ملاحظات
              <span className="font-normal text-muted-foreground">
                {" "}
                (اختياري)
              </span>
            </label>

            <textarea
              id="order-notes"
              rows={3}
              placeholder="أي معلومات إضافية للطلب..."
              className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              {...register(
                "notes",
              )}
            />

            {errors.notes ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {
                  errors.notes
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck
                    className="size-4"
                    aria-hidden="true"
                  />

                  سعر التوصيل
                </span>

                <span className="font-semibold">
                  {selectedWilaya
                    ? formatPrice(
                        deliveryFee,
                      )
                    : "اختر الولاية"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PackageCheck
                    className="size-4"
                    aria-hidden="true"
                  />

                  سعر الكتب
                </span>

                <span className="font-semibold">
                  {formatPrice(
                    subtotal,
                  )}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
                <span>
                  <span className="block text-sm text-muted-foreground">
                    التكلفة
                    الإجمالية
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    الدفع عند
                    الاستلام
                  </span>
                </span>

                <span className="text-2xl font-extrabold text-primary tabular-nums">
                  {formatPrice(
                    total,
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              book.stock <=
                0
            }
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="size-5 animate-spin"
                  aria-hidden="true"
                />

                جار إرسال الطلب...
              </>
            ) : (
              <>
                <ShoppingBag
                  className="size-5"
                  aria-hidden="true"
                />

                اطلب الآن
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}