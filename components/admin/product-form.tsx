"use client";

/* eslint-disable @next/next/no-img-element */

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Save,
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useRef,
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
  createProduct,
  updateProduct,
} from "@/app/admin/(panel)/products/actions";
import {
  MAX_PRODUCT_IMAGE_BYTES,
  prepareProductImage,
} from "@/lib/images/compress-product-image";
import {
  emptyProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/products/product-schema";
import {
  arabicSafeSlug,
} from "@/lib/products/slug";
import {
  createClient,
} from "@/lib/supabase/client";

const MAX_BOOK_IMAGES =
  3;

const INTERNAL_STOCK =
  1_000_000;

const RIWAYA_SUGGESTIONS = [
  "حفص عن عاصم",
  "ورش عن نافع",
  "قالون عن نافع",
] as const;

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  mode:
    | "create"
    | "edit";

  categories:
    CategoryOption[];

  productId?: string;

  initialValues?:
    ProductFormValues;
};

function fieldClassName(
  hasError: boolean,
) {
  return [
    "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition",
    "placeholder:text-muted-foreground",
    "focus:ring-2 focus:ring-primary/15",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-primary",
  ].join(" ");
}

function textareaClassName(
  hasError: boolean,
) {
  return [
    "min-h-36 w-full resize-y rounded-xl border bg-background px-3 py-3 text-sm leading-7 outline-none transition",
    "placeholder:text-muted-foreground",
    "focus:ring-2 focus:ring-primary/15",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-primary",
  ].join(" ");
}

export function ProductForm({
  mode,
  categories,
  productId,
  initialValues,
}: ProductFormProps) {
  const router =
    useRouter();

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    slugIsManuallyEdited,
    setSlugIsManuallyEdited,
  ] = useState(
    mode === "edit",
  );

  const newlyUploadedImages =
    useRef<
      Map<string, string>
    >(
      new Map(),
    );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<ProductFormValues>({
      resolver:
        zodResolver(
          productFormSchema,
        ),

      defaultValues:
        initialValues
          ? {
              ...initialValues,

              images: [
                ...initialValues.images,
              ],
            }
          : {
              ...emptyProductFormValues,

              /*
               * Stock is kept internally only.
               * It is not editable by the admin.
               */
              stock:
                INTERNAL_STOCK,

              images: [],
            },
    });

  const bookName =
    useWatch({
      control,
      name: "name",
    }) ?? "";

  const images =
    useWatch({
      control,
      name: "images",
    }) ?? [];

  useEffect(() => {
    if (
      slugIsManuallyEdited
    ) {
      return;
    }

    setValue(
      "slug",
      arabicSafeSlug(
        bookName,
      ),
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }, [
    bookName,
    setValue,
    slugIsManuallyEdited,
  ]);

  async function handleImagesSelected(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const input =
      event.currentTarget;

    const files =
      Array.from(
        input.files ?? [],
      );

    input.value = "";

    if (
      files.length === 0
    ) {
      return;
    }

    const currentImages =
      getValues(
        "images",
      );

    if (
      currentImages.length +
        files.length >
      MAX_BOOK_IMAGES
    ) {
      toast.error(
        `يمكن إضافة ${MAX_BOOK_IMAGES} صور كحد أقصى للكتاب.`,
      );

      return;
    }

    setIsUploading(
      true,
    );

    try {
      const supabase =
        createClient();

      let nextImages = [
        ...currentImages,
      ];

      for (
        const file of files
      ) {
        if (
          file.size >
          MAX_PRODUCT_IMAGE_BYTES
        ) {
          toast.error(
            `${file.name}: حجم الصورة يجب ألا يتجاوز 3 ميغابايت.`,
          );

          continue;
        }

        try {
          const processedFile =
            await prepareProductImage(
              file,
            );

          const folder =
            new Date()
              .toISOString()
              .slice(
                0,
                7,
              );

          const storagePath =
            `admin/${folder}/${crypto.randomUUID()}.webp`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "products",
              )
              .upload(
                storagePath,
                processedFile,
                {
                  cacheControl:
                    "31536000",

                  upsert:
                    false,

                  contentType:
                    "image/webp",
                },
              );

          if (
            uploadError
          ) {
            throw uploadError;
          }

          const {
            data,
          } =
            supabase.storage
              .from(
                "products",
              )
              .getPublicUrl(
                storagePath,
              );

          if (
            !data.publicUrl
          ) {
            await supabase.storage
              .from(
                "products",
              )
              .remove([
                storagePath,
              ]);

            throw new Error(
              "تعذر إنشاء رابط الصورة.",
            );
          }

          newlyUploadedImages.current.set(
            data.publicUrl,
            storagePath,
          );

          nextImages = [
            ...nextImages,
            data.publicUrl,
          ];

          setValue(
            "images",
            nextImages,
            {
              shouldDirty:
                true,

              shouldValidate:
                true,
            },
          );
        } catch (
          error
        ) {
          console.error(
            "فشل رفع صورة الكتاب:",
            error,
          );

          toast.error(
            `تعذر رفع الصورة: ${file.name}`,
          );
        }
      }
    } finally {
      setIsUploading(
        false,
      );
    }
  }

  async function removeImage(
    imageUrl: string,
  ) {
    const storagePath =
      newlyUploadedImages.current.get(
        imageUrl,
      );

    if (
      storagePath
    ) {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.storage
          .from(
            "products",
          )
          .remove([
            storagePath,
          ]);

      if (error) {
        console.error(
          "تعذر حذف الصورة الجديدة:",
          error,
        );

        toast.error(
          "تعذر حذف الصورة.",
        );

        return;
      }

      newlyUploadedImages.current.delete(
        imageUrl,
      );
    }

    setValue(
      "images",
      getValues(
        "images",
      ).filter(
        (
          currentImage,
        ) =>
          currentImage !==
          imageUrl,
      ),
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }

  function moveImage(
    index: number,
    direction:
      | "up"
      | "down",
  ) {
    const current =
      [
        ...getValues(
          "images",
        ),
      ];

    const nextIndex =
      direction ===
      "up"
        ? index - 1
        : index + 1;

    if (
      nextIndex <
        0 ||
      nextIndex >=
        current.length
    ) {
      return;
    }

    [
      current[index],
      current[nextIndex],
    ] = [
      current[
        nextIndex
      ],
      current[index],
    ];

    setValue(
      "images",
      current,
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }

  async function onSubmit(
    values:
      ProductFormValues,
  ) {
    if (
      values.images.length >
      MAX_BOOK_IMAGES
    ) {
      toast.error(
        "لا يمكن إضافة أكثر من 3 صور للكتاب.",
      );

      return;
    }

    /*
     * Stock stays internal.
     * Creating a book always starts with
     * the internal compatibility value.
     */
    const payload:
      ProductFormValues = {
      ...values,

      stock:
        mode === "create"
          ? INTERNAL_STOCK
          : values.stock,
    };

    const result =
      mode === "create"
        ? await createProduct(
            payload,
          )
        : productId
          ? await updateProduct(
              productId,
              payload,
            )
          : {
              success:
                false as const,

              message:
                "معرّف الكتاب غير موجود.",
            };

    if (
      !result.success
    ) {
      toast.error(
        result.message,
      );

      return;
    }

    newlyUploadedImages.current.clear();

    toast.success(
      result.message,
    );

    router.push(
      "/admin/products",
    );

    router.refresh();
  }

  const slugField =
    register(
      "slug",
    );

  const disabled =
    isSubmitting ||
    isUploading;

  return (
    <form
      onSubmit={(
        event,
      ) => {
        void handleSubmit(
          onSubmit,
        )(event);
      }}
      className="space-y-6"
    >
      {/*
       * Hidden compatibility field.
       * The admin no longer manages stock.
       */}
      <input
        type="hidden"
        {...register(
          "stock",
          {
            valueAsNumber:
              true,
          },
        )}
      />

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            معلومات الكتاب
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            المعلومات الأساسية
            التي ستظهر للعميل.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="book-name"
              className="mb-2 block text-sm font-semibold"
            >
              عنوان الكتاب
            </label>

            <input
              id="book-name"
              type="text"
              placeholder="مثال: مصحف التجويد الملون"
              className={
                fieldClassName(
                  Boolean(
                    errors.name,
                  ),
                )
              }
              {...register(
                "name",
              )}
            />

            {errors.name ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.name
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="book-slug"
              className="mb-2 block text-sm font-semibold"
            >
              الرابط المختصر
            </label>

            <input
              id="book-slug"
              name={
                slugField.name
              }
              ref={
                slugField.ref
              }
              onBlur={
                slugField.onBlur
              }
              type="text"
              dir="ltr"
              placeholder="اسم-الكتاب"
              className={`${fieldClassName(
                Boolean(
                  errors.slug,
                ),
              )} text-end`}
              onChange={(
                event,
              ) => {
                setSlugIsManuallyEdited(
                  true,
                );

                setValue(
                  "slug",
                  arabicSafeSlug(
                    event
                      .target
                      .value,
                  ),
                  {
                    shouldDirty:
                      true,

                    shouldValidate:
                      true,
                  },
                );
              }}
            />

            {errors.slug ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.slug
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="book-publisher"
              className="mb-2 block text-sm font-semibold"
            >
              الناشر
            </label>

            <input
              id="book-publisher"
              type="text"
              placeholder="اسم دار النشر"
              className={
                fieldClassName(
                  Boolean(
                    errors.publisher,
                  ),
                )
              }
              {...register(
                "publisher",
              )}
            />

            {errors.publisher ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.publisher
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="book-riwaya"
              className="mb-2 block text-sm font-semibold"
            >
              الرواية
            </label>

            <input
              id="book-riwaya"
              type="text"
              list="riwaya-suggestions"
              placeholder="مثال: حفص عن عاصم"
              className={
                fieldClassName(
                  Boolean(
                    errors.riwaya,
                  ),
                )
              }
              {...register(
                "riwaya",
              )}
            />

            <datalist id="riwaya-suggestions">
              {RIWAYA_SUGGESTIONS.map(
                (
                  suggestion,
                ) => (
                  <option
                    key={
                      suggestion
                    }
                    value={
                      suggestion
                    }
                  />
                ),
              )}
            </datalist>

            {errors.riwaya ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.riwaya
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="book-category"
              className="mb-2 block text-sm font-semibold"
            >
              التصنيف
            </label>

            <select
              id="book-category"
              className={
                fieldClassName(
                  Boolean(
                    errors.category_id,
                  ),
                )
              }
              {...register(
                "category_id",
              )}
            >
              <option value="">
                اختر التصنيف
              </option>

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>

            {errors.category_id ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors
                    .category_id
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="book-price"
              className="mb-2 block text-sm font-semibold"
            >
              السعر
            </label>

            <div className="relative">
              <input
                id="book-price"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className={`${fieldClassName(
                  Boolean(
                    errors.price,
                  ),
                )} pe-14`}
                {...register(
                  "price",
                  {
                    valueAsNumber:
                      true,
                  },
                )}
              />

              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                د.ج
              </span>
            </div>

            {errors.price ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.price
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="book-description"
              className="mb-2 block text-sm font-semibold"
            >
              الوصف
            </label>

            <textarea
              id="book-description"
              placeholder="وصف مختصر وواضح للكتاب..."
              className={
                textareaClassName(
                  Boolean(
                    errors.description,
                  ),
                )
              }
              {...register(
                "description",
              )}
            />

            {errors.description ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors
                    .description
                    .message
                }
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">
              صور الكتاب
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              بحد أقصى 3 صور،
              JPG أو PNG أو WebP،
              وأقل من 3 ميغابايت.
            </p>
          </div>

          <label
            className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted ${
              disabled ||
              images.length >=
                MAX_BOOK_IMAGES
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            {isUploading ? (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ImagePlus
                className="size-4"
                aria-hidden="true"
              />
            )}

            إضافة صور

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={
                disabled ||
                images.length >=
                  MAX_BOOK_IMAGES
              }
              onChange={(
                event,
              ) => {
                void handleImagesSelected(
                  event,
                );
              }}
              className="sr-only"
            />
          </label>
        </div>

        {errors.images ? (
          <p className="mb-4 text-xs text-destructive">
            {
              errors.images
                .message
            }
          </p>
        ) : null}

        {images.length ===
        0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <div>
              <ImagePlus
                className="mx-auto size-8 text-muted-foreground"
                aria-hidden="true"
              />

              <p className="mt-3 text-sm font-medium">
                لا توجد صور بعد
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                الصورة الأولى
                ستكون الصورة الرئيسية.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(
              (
                image,
                index,
              ) => (
                <div
                  key={
                    image
                  }
                  className="overflow-hidden rounded-2xl border border-border bg-muted/20"
                >
                  <div className="relative aspect-[3/4] bg-muted">
                    <img
                      src={
                        image
                      }
                      alt={`صورة الكتاب ${
                        index +
                        1
                      }`}
                      className="size-full object-cover"
                    />

                    {index ===
                    0 ? (
                      <span className="absolute start-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        الرئيسية
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        void removeImage(
                          image,
                        );
                      }}
                      disabled={
                        disabled
                      }
                      aria-label="حذف الصورة"
                      className="absolute end-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                    >
                      <X
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="text-xs text-muted-foreground">
                      الصورة{" "}
                      {
                        index +
                        1
                      }
                    </p>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={
                          index ===
                            0 ||
                          disabled
                        }
                        onClick={() =>
                          moveImage(
                            index,
                            "up",
                          )
                        }
                        aria-label="نقل الصورة للأعلى"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowUp
                          className="size-4"
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                            images.length -
                              1 ||
                          disabled
                        }
                        onClick={() =>
                          moveImage(
                            index,
                            "down",
                          )
                        }
                        aria-label="نقل الصورة للأسفل"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowDown
                          className="size-4"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          {
            images.length
          }{" "}
          من{" "}
          {
            MAX_BOOK_IMAGES
          }{" "}
          صور
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold">
          الظهور في المتجر
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              {...register(
                "is_active",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                كتاب نشط
              </span>

              <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                يظهر الكتاب ويمكن
                للعملاء طلبه.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              {...register(
                "is_featured",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                كتاب مميز
              </span>

              <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                يمكن استخدامه في
                أقسام الكتب المميزة.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            disabled
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {disabled ? (
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Save
              className="size-4"
              aria-hidden="true"
            />
          )}

          {mode === "create"
            ? "إضافة الكتاب"
            : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}