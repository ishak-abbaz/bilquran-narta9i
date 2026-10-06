"use client";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  Loader2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  type FieldPath,
  useForm,
} from "react-hook-form";

import {
  createOrderAction,
  type CreateOrderActionResult,
} from "@/app/(store)/product/[slug]/actions";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatPrice,
} from "@/lib/utils";
import {
  orderSchema,
  type OrderInput,
} from "@/lib/validation/order";
import type {
  DeliveryPrice,
} from "@/types";

type OrderBook = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type OrderFormProps = {
  book: OrderBook;

  deliveryPrices:
    DeliveryPrice[];

  freeDeliveryThreshold:
    number | null;
};

type OrderFormFieldsProps =
  OrderFormProps;

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function OrderFormFields({
  book,
  deliveryPrices,
  freeDeliveryThreshold,
}: OrderFormFieldsProps) {
  const maxQuantity =
    Math.min(
      book.stock,
      10,
    );

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<OrderInput>({
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

      wilayaCode: 0,

      deliveryType:
        "home",

      address: "",

      notes: "",
    },
  });

  const watchedQuantity =
    watch("quantity");

  const watchedWilayaCode =
    watch("wilayaCode");

  const deliveryType =
    watch("deliveryType");

  /*
   * Desk delivery does not need an address.
   * Remove any old address error/value when
   * the user switches from home to desk.
   */
  useEffect(() => {
    if (
      deliveryType !==
      "desk"
    ) {
      return;
    }

    clearErrors(
      "address",
    );

    setValue(
      "address",
      "",
      {
        shouldValidate:
          false,
        shouldDirty:
          false,
      },
    );
  }, [
    deliveryType,
    clearErrors,
    setValue,
  ]);

  const quantity =
    Number.isInteger(
      watchedQuantity,
    ) &&
    watchedQuantity > 0
      ? Math.min(
          watchedQuantity,
          maxQuantity,
        )
      : 1;

  const selectedWilaya =
    deliveryPrices.find(
      (item) =>
        item.wilaya_code ===
        Number(
          watchedWilayaCode,
        ),
    );

  const subtotal =
    book.price *
    quantity;

  const qualifiesForFreeDelivery =
    freeDeliveryThreshold !==
      null &&
    subtotal >=
      freeDeliveryThreshold;

  const normalDeliveryFee =
    selectedWilaya
      ? deliveryType ===
        "home"
        ? selectedWilaya
            .home_price
        : selectedWilaya
            .desk_price
      : 0;

  const deliveryFee =
    selectedWilaya &&
    qualifiesForFreeDelivery
      ? 0
      : normalDeliveryFee;

  const total =
    subtotal +
    deliveryFee;

  function applyServerErrors(
    result: CreateOrderActionResult,
  ) {
    if (
      !result.fieldErrors
    ) {
      setError(
        "root.server",
        {
          type: "server",
          message:
            result.message,
        },
      );

      return;
    }

    let hasFieldError =
      false;

    for (
      const [
        field,
        messages,
      ] of Object.entries(
        result.fieldErrors,
      )
    ) {
      const message =
        messages?.[0];

      if (!message) {
        continue;
      }

      hasFieldError =
        true;

      setError(
        field as FieldPath<OrderInput>,
        {
          type: "server",
          message,
        },
      );
    }

    if (
      !hasFieldError
    ) {
      setError(
        "root.server",
        {
          type: "server",
          message:
            result.message,
        },
      );
    }
  }

  async function onSubmit(
    values: OrderInput,
  ) {
    clearErrors(
      "root.server",
    );

    /*
     * On success the Server Action redirects.
     * If execution returns here, it is an error.
     */
    const result =
      await createOrderAction(
        values,
      );

    applyServerErrors(
      result,
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit(
          onSubmit,
        )
      }
      className="space-y-5"
    >
      <input
        type="hidden"
        {...register(
          "productId",
        )}
      />

      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-semibold">
          {book.name}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {formatPrice(
            book.price,
          )}{" "}
          للنسخة
        </p>
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
          disabled={
            isSubmitting
          }
          className={
            inputClassName
          }
          {...register(
            "fullName",
          )}
        />

        <FieldError
          message={
            errors
              .fullName
              ?.message
          }
        />
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
          autoComplete="tel"
          placeholder="0550 00 00 00"
          disabled={
            isSubmitting
          }
          className={`${inputClassName} text-end`}
          {...register(
            "phone",
          )}
        />

        <FieldError
          message={
            errors
              .phone
              ?.message
          }
        />
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
          disabled={
            isSubmitting
          }
          className={
            inputClassName
          }
          {...register(
            "wilayaCode",
            {
              setValueAs:
                (value) =>
                  value === ""
                    ? 0
                    : Number(
                        value,
                      ),
            },
          )}
        >
          <option value="">
            اختر الولاية
          </option>

          {deliveryPrices.map(
            (wilaya) => (
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

        <FieldError
          message={
            errors
              .wilayaCode
              ?.message
          }
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          نوع التوصيل
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors has-checked:border-primary has-checked:bg-accent">
            <input
              type="radio"
              value="home"
              disabled={
                isSubmitting
              }
              className="size-4 accent-primary"
              {...register(
                "deliveryType",
              )}
            />

            <span className="text-sm font-medium">
              توصيل للمنزل
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors has-checked:border-primary has-checked:bg-accent">
            <input
              type="radio"
              value="desk"
              disabled={
                isSubmitting
              }
              className="size-4 accent-primary"
              {...register(
                "deliveryType",
              )}
            />

            <span className="text-sm font-medium">
              توصيل للمكتب
            </span>
          </label>
        </div>

        <FieldError
          message={
            errors
              .deliveryType
              ?.message
          }
        />
      </fieldset>

      {deliveryType ===
      "home" ? (
        <div>
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
            disabled={
              isSubmitting
            }
            placeholder="البلدية، الحي، الشارع..."
            className={
              inputClassName
            }
            {...register(
              "address",
            )}
          />

          <FieldError
            message={
              errors
                .address
                ?.message
            }
          />
        </div>
      ) : null}

      <div>
        <label
          htmlFor="order-notes"
          className="mb-2 block text-sm font-semibold"
        >
          ملاحظات

          <span className="ms-1 font-normal text-muted-foreground">
            (اختياري)
          </span>
        </label>

        <textarea
          id="order-notes"
          rows={3}
          disabled={
            isSubmitting
          }
          placeholder="أي معلومات إضافية حول الطلب أو التوصيل"
          className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          {...register(
            "notes",
          )}
        />

        <FieldError
          message={
            errors
              .notes
              ?.message
          }
        />
      </div>

      <div>
        <label
          htmlFor="order-quantity"
          className="mb-2 block text-sm font-semibold"
        >
          الكمية
        </label>

        <input
          id="order-quantity"
          type="number"
          min={1}
          max={
            maxQuantity
          }
          step={1}
          disabled={
            isSubmitting
          }
          className={
            inputClassName
          }
          {...register(
            "quantity",
            {
              valueAsNumber:
                true,
            },
          )}
        />

        <p className="mt-2 text-xs text-muted-foreground">
          الحد الأقصى لهذا
          الطلب:{" "}
          {maxQuantity}
        </p>

        <FieldError
          message={
            errors
              .quantity
              ?.message
          }
        />
      </div>

      {/* Live summary */}
      <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            سعر الكتب
          </span>

          <span className="font-semibold">
            {formatPrice(
              subtotal,
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            التوصيل
          </span>

          <span className="font-semibold">
            {!selectedWilaya
              ? "اختر الولاية"
              : deliveryFee ===
                  0
                ? "مجاني"
                : formatPrice(
                    deliveryFee,
                  )}
          </span>
        </div>

        {freeDeliveryThreshold !==
        null ? (
          <p className="text-xs leading-6 text-muted-foreground">
            التوصيل مجاني عند
            بلوغ قيمة الطلب{" "}
            {formatPrice(
              freeDeliveryThreshold,
            )}
            .
          </p>
        ) : null}

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold">
              الإجمالي
            </span>

            <span className="text-lg font-bold text-primary">
              {formatPrice(
                total,
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            طريقة الدفع
          </span>

          <span className="font-semibold">
            الدفع عند الاستلام
          </span>
        </div>
      </div>

      {errors.root
        ?.server
        ?.message ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {
            errors.root
              .server
              .message
          }
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={
          isSubmitting
        }
        className="h-12 w-full"
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
          "تأكيد الطلب"
        )}
      </Button>
    </form>
  );
}

export default function OrderForm({
  book,
  deliveryPrices,
  freeDeliveryThreshold,
}: OrderFormProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  if (
    book.stock === 0
  ) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center font-semibold text-destructive">
        نفدت الكمية
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <Dialog
          open={open}
          onOpenChange={
            setOpen
          }
        >
          <DialogTrigger
            render={
              <Button
                type="button"
                className="h-12 w-full"
              />
            }
          >
            اطلب الآن
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                إتمام الطلب
              </DialogTitle>

              <DialogDescription>
                أدخل معلوماتك لإرسال
                طلبك. الدفع عند
                الاستلام.
              </DialogDescription>
            </DialogHeader>

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
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop */}
      <div className="hidden rounded-2xl border border-border bg-card p-6 lg:block">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            اطلب الآن
          </h2>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            أدخل معلوماتك لإرسال
            الطلب. الدفع عند
            الاستلام.
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
    </>
  );
}