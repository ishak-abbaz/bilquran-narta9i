"use client";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  useState,
} from "react";
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
  orderSchema,
  type OrderInput,
} from "@/lib/validation/order";
import {
  formatPrice,
} from "@/lib/utils";
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
  freeDeliveryThreshold:
    | number
    | null;
};

type OrderFormFieldsProps =
  OrderFormProps;

function fieldClassName(
  hasError: boolean,
) {
  return [
    "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition",
    "placeholder:text-muted-foreground",
    "focus:ring-2 focus:ring-ring/20",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-foreground/30",
  ].join(" ");
}

function OrderFormFields({
  book,
  deliveryPrices,
  freeDeliveryThreshold,
}: OrderFormFieldsProps) {
  /*
   * Defensive boundary.
   * A missing prop must never crash the storefront.
   */
  const safeDeliveryPrices =
    Array.isArray(
      deliveryPrices,
    )
      ? deliveryPrices
      : [];

  const maxQuantity =
    Math.max(
      1,
      Math.min(
        book.stock,
        10,
      ),
    );

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
          "desk",

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
    }) ?? firstWilayaCode;

  const deliveryType =
    useWatch({
      control,
      name: "deliveryType",
    }) ?? "desk";

  const selectedWilaya =
    safeDeliveryPrices.find(
      (item) =>
        item.wilaya_code ===
        Number(
          wilayaCode,
        ),
    );

  const subtotal =
    book.price *
    Number(
      quantity || 1,
    );

  const baseDeliveryFee =
    selectedWilaya
      ? deliveryType ===
        "home"
        ? selectedWilaya.home_price
        : selectedWilaya.desk_price
      : 0;

  const qualifiesForFreeDelivery =
    freeDeliveryThreshold !==
      null &&
    freeDeliveryThreshold >
      0 &&
    subtotal >=
      freeDeliveryThreshold;

  const displayedDeliveryFee =
    qualifiesForFreeDelivery
      ? 0
      : baseDeliveryFee;

  const displayedTotal =
    subtotal +
    displayedDeliveryFee;

  function decreaseQuantity() {
    const next =
      Math.max(
        1,
        Number(
          quantity,
        ) - 1,
      );

    setValue(
      "quantity",
      next,
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }

  function increaseQuantity() {
    const next =
      Math.min(
        maxQuantity,
        Number(
          quantity,
        ) + 1,
      );

    setValue(
      "quantity",
      next,
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }

  async function onSubmit(
    values: OrderInput,
  ) {
    try {
      const result =
        await createOrderAction(
          values,
        );

      /*
       * Successful createOrderAction redirects to
       * /order-success, so only failures normally
       * return here.
       */
      if (
        result &&
        result.success ===
          false
      ) {
        toast.error(
          result.message,
        );
      }
    } catch (
      error
    ) {
      /*
       * Next.js redirect exceptions are handled by
       * the framework. Unexpected failures are logged.
       */
      if (
        error instanceof
          Error &&
        error.message.includes(
          "NEXT_REDIRECT",
        )
      ) {
        throw error;
      }

      console.error(
        "فشل إرسال الطلب:",
        error,
      );

      toast.error(
        "تعذر إرسال الطلب. حاول مرة أخرى.",
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
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm leading-7 text-destructive"
      >
        أسعار التوصيل غير متوفرة
        حالياً. يرجى المحاولة لاحقاً.
      </div>
    );
  }

  return (
    <form
      onSubmit={(
        event,
      ) => {
        void handleSubmit(
          onSubmit,
        )(event);
      }}
      className="space-y-5"
    >
      <input
        type="hidden"
        {...register(
          "productId",
        )}
      />

      <div className="rounded-xl bg-muted/60 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              الكمية
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              المتوفر:{" "}
              {
                book.stock
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={
                decreaseQuantity
              }
              disabled={
                Number(
                  quantity,
                ) <= 1
              }
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              aria-label="إنقاص الكمية"
            >
              <Minus
                className="size-4"
                aria-hidden="true"
              />
            </button>

            <input
              type="number"
              min={1}
              max={
                maxQuantity
              }
              inputMode="numeric"
              className="h-9 w-14 rounded-lg border border-input bg-background text-center text-sm font-semibold outline-none"
              {...register(
                "quantity",
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            <button
              type="button"
              onClick={
                increaseQuantity
              }
              disabled={
                Number(
                  quantity,
                ) >=
                maxQuantity
              }
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              aria-label="زيادة الكمية"
            >
              <Plus
                className="size-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {errors.quantity ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors.quantity
                .message
            }
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="order-full-name"
          className="mb-2 block text-sm font-semibold"
        >
          الاسم الكامل
        </label>

        <input
          id="order-full-name"
          type="text"
          autoComplete="name"
          placeholder="الاسم واللقب"
          className={
            fieldClassName(
              Boolean(
                errors.fullName,
              ),
            )
          }
          {...register(
            "fullName",
          )}
        />

        {errors.fullName ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors.fullName
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
          )} text-end`}
          {...register(
            "phone",
          )}
        />

        {errors.phone ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors.phone
                .message
            }
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="order-wilaya"
          className="mb-2 block text-sm font-semibold"
        >
          الولاية
        </label>

        <select
          id="order-wilaya"
          className={
            fieldClassName(
              Boolean(
                errors.wilayaCode,
              ),
            )
          }
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

        {errors.wilayaCode ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors
                .wilayaCode
                .message
            }
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          طريقة التوصيل
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              value="desk"
              className="mt-1 accent-primary"
              {...register(
                "deliveryType",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                مكتب التوصيل
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                {selectedWilaya
                  ? formatPrice(
                      selectedWilaya.desk_price,
                    )
                  : ""}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              value="home"
              className="mt-1 accent-primary"
              {...register(
                "deliveryType",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                التوصيل إلى المنزل
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                {selectedWilaya
                  ? formatPrice(
                      selectedWilaya.home_price,
                    )
                  : ""}
              </span>
            </span>
          </label>
        </div>

        {errors.deliveryType ? (
          <p className="mt-2 text-xs text-destructive">
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
        <div>
          <label
            htmlFor="order-address"
            className="mb-2 block text-sm font-semibold"
          >
            عنوان المنزل
          </label>

          <input
            id="order-address"
            type="text"
            autoComplete="street-address"
            placeholder="البلدية، الحي، العنوان..."
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
            <p className="mt-2 text-xs text-destructive">
              {
                errors.address
                  .message
              }
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
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
          className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
          {...register(
            "notes",
          )}
        />

        {errors.notes ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors.notes
                .message
            }
          </p>
        ) : null}
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <ShoppingBag
            className="size-4"
            aria-hidden="true"
          />

          ملخص الطلب
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            الكتاب ×{" "}
            {
              quantity
            }
          </span>

          <span className="font-medium">
            {formatPrice(
              subtotal,
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Truck
              className="size-4"
              aria-hidden="true"
            />

            التوصيل
          </span>

          <span className="font-medium">
            {displayedDeliveryFee ===
            0
              ? "مجاني"
              : formatPrice(
                  displayedDeliveryFee,
                )}
          </span>
        </div>

        {freeDeliveryThreshold !==
          null &&
        freeDeliveryThreshold >
          0 ? (
          <p className="text-xs leading-6 text-muted-foreground">
            التوصيل مجاني للطلبات
            ابتداءً من{" "}
            {formatPrice(
              freeDeliveryThreshold,
            )}
            .
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <span className="font-bold">
            الإجمالي المتوقع
          </span>

          <span className="text-lg font-bold text-primary">
            {formatPrice(
              displayedTotal,
            )}
          </span>
        </div>

        <p className="text-xs leading-6 text-muted-foreground">
          السعر النهائي ورسوم التوصيل
          يتم التحقق منهما في الخادم
          عند إنشاء الطلب.
        </p>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting ||
          book.stock <= 0
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />

            جار إرسال الطلب...
          </>
        ) : (
          <>
            <ShoppingBag
              className="size-4"
              aria-hidden="true"
            />

            اطلب الآن
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        الدفع عند الاستلام
      </p>
    </form>
  );
}

export default function OrderForm({
  book,
  deliveryPrices,
  freeDeliveryThreshold,
}: OrderFormProps) {
  /*
   * Keep these props explicit here.
   * The previous implementation dropped
   * deliveryPrices before OrderFormFields,
   * which caused deliveryPrices.find()
   * to crash at runtime.
   */
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          اطلب الكتاب
        </h2>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          أدخل معلوماتك واختر طريقة
          التوصيل. الدفع عند الاستلام.
        </p>
      </div>

      <OrderFormFields
        book={
          book
        }
        deliveryPrices={
          deliveryPrices
        }
        freeDeliveryThreshold={
          freeDeliveryThreshold
        }
      />
    </div>
  );
}