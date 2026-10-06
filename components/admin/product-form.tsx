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
  MAX_PRODUCT_IMAGE_COUNT,
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
    "focus:ring-2 focus:ring-ring/20",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-foreground/30",
  ].join(" ");
}

function textareaClassName(
  hasError: boolean,
) {
  return [
    "min-h-36 w-full resize-y rounded-xl border bg-background px-3 py-3 text-sm leading-7 outline-none transition",
    "placeholder:text-muted-foreground",
    "focus:ring-2 focus:ring-ring/20",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-input focus:border-foreground/30",
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

  const [
    newlyUploadedImages,
    setNewlyUploadedImages,
  ] = useState<
    Record<
      string,
      string
    >
  >({});

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
              images: [],
            },
    });

  const images =
    useWatch({
      control,
      name: "images",
    }) ?? [];

  const nameRegistration =
    register("name");

  const slugRegistration =
    register("slug");

  async function handleImagesSelected(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const input =
      event.currentTarget;

    const selectedFiles =
      Array.from(
        input.files ??
          [],
      );

    input.value = "";

    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }

    const currentImages =
      getValues(
        "images",
      );

    const availableSlots =
      MAX_PRODUCT_IMAGE_COUNT -
      currentImages.length;

    if (
      availableSlots <=
      0
    ) {
      toast.error(
        "وصلت إلى الحد الأقصى وهو 3 صور.",
      );

      return;
    }

    const filesToUpload =
      selectedFiles.slice(
        0,
        availableSlots,
      );

    if (
      selectedFiles.length >
      availableSlots
    ) {
      toast.error(
        `يمكنك إضافة ${availableSlots} صورة فقط.`,
      );
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
        const file of
          filesToUpload
      ) {
        if (
          file.size >
          MAX_PRODUCT_IMAGE_BYTES
        ) {
          toast.error(
            `${file.name}: الحجم يتجاوز 3 ميغابايت.`,
          );

          continue;
        }

        try {
          const processedFile =
            await prepareProductImage(
              file,
            );

          const dateFolder =
            new Date()
              .toISOString()
              .slice(
                0,
                7,
              );

          const storagePath =
            `admin/${dateFolder}/${crypto.randomUUID()}.webp`;

          const {
            error:
              uploadError,
          } =
            await supabase
              .storage
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
          } = supabase
            .storage
            .from(
              "products",
            )
            .getPublicUrl(
              storagePath,
            );

          if (
            !data.publicUrl
          ) {
            await supabase
              .storage
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

          setNewlyUploadedImages(
            (
              current,
            ) => ({
              ...current,
              [data.publicUrl]:
                storagePath,
            }),
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
    index: number,
  ) {
    const current =
      getValues(
        "images",
      );

    const imageUrl =
      current[
        index
      ];

    if (!imageUrl) {
      return;
    }

    const newlyUploadedPath =
      newlyUploadedImages[
        imageUrl
      ];

    if (
      newlyUploadedPath
    ) {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase
          .storage
          .from(
            "products",
          )
          .remove([
            newlyUploadedPath,
          ]);

      if (error) {
        toast.error(
          "تعذر حذف الصورة المرفوعة.",
        );

        return;
      }

      setNewlyUploadedImages(
        (
          currentMap,
        ) => {
          const nextMap = {
            ...currentMap,
          };

          delete nextMap[
            imageUrl
          ];

          return nextMap;
        },
      );
    }

    const next =
      current.filter(
        (
          _,
          currentIndex,
        ) =>
          currentIndex !==
          index,
      );

    setValue(
      "images",
      next,
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );
  }

  function moveImage(
    fromIndex: number,
    toIndex: number,
  ) {
    const current = [
      ...getValues(
        "images",
      ),
    ];

    if (
      toIndex < 0 ||
      toIndex >=
        current.length
    ) {
      return;
    }

    const [
      movedImage,
    ] =
      current.splice(
        fromIndex,
        1,
      );

    if (!movedImage) {
      return;
    }

    current.splice(
      toIndex,
      0,
      movedImage,
    );

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
      isUploading
    ) {
      toast.error(
        "انتظر حتى يكتمل رفع الصور.",
      );

      return;
    }

    if (
      values.images
        .length >
      MAX_PRODUCT_IMAGE_COUNT
    ) {
      toast.error(
        "لا يمكن إضافة أكثر من 3 صور للكتاب.",
      );

      return;
    }

    try {
      const result =
        mode ===
        "create"
          ? await createProduct(
              values,
            )
          : await updateProduct(
              productId ??
                "",
              values,
            );

      if (
        !result.success
      ) {
        toast.error(
          result.message,
        );

        return;
      }

      setNewlyUploadedImages(
        {},
      );

      toast.success(
        result.message,
      );

      if (
        mode ===
        "create"
      ) {
        router.push(
          `/admin/products/${result.productId}`,
        );

        router.refresh();

        return;
      }

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "فشل حفظ الكتاب:",
        error,
      );

      toast.error(
        "حدث خطأ غير متوقع أثناء حفظ الكتاب.",
      );
    }
  }

  const isBusy =
    isSubmitting ||
    isUploading;

  const imageLimitReached =
    images.length >=
    MAX_PRODUCT_IMAGE_COUNT;

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
      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            المعلومات الأساسية
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            عنوان الكتاب والرابط
            والوصف والتصنيف.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold"
            >
              عنوان الكتاب
            </label>

            <input
              id="name"
              type="text"
              autoComplete="off"
              placeholder="مثال: مصحف المدينة النبوية"
              className={
                fieldClassName(
                  Boolean(
                    errors.name,
                  ),
                )
              }
              {...nameRegistration}
              onChange={(
                event,
              ) => {
                void nameRegistration.onChange(
                  event,
                );

                if (
                  !slugIsManuallyEdited
                ) {
                  setValue(
                    "slug",
                    arabicSafeSlug(
                      event.target
                        .value,
                    ),
                    {
                      shouldDirty:
                        true,

                      shouldValidate:
                        true,
                    },
                  );
                }
              }}
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

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="slug"
                className="text-sm font-semibold"
              >
                الرابط المختصر
              </label>

              <button
                type="button"
                onClick={() => {
                  const generatedSlug =
                    arabicSafeSlug(
                      getValues(
                        "name",
                      ),
                    );

                  setSlugIsManuallyEdited(
                    false,
                  );

                  setValue(
                    "slug",
                    generatedSlug,
                    {
                      shouldDirty:
                        true,

                      shouldValidate:
                        true,
                    },
                  );
                }}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                توليد من العنوان
              </button>
            </div>

            <input
              id="slug"
              type="text"
              dir="ltr"
              autoComplete="off"
              className={`${fieldClassName(
                Boolean(
                  errors.slug,
                ),
              )} text-end`}
              {...slugRegistration}
              onChange={(
                event,
              ) => {
                setSlugIsManuallyEdited(
                  true,
                );

                event.target.value =
                  arabicSafeSlug(
                    event.target
                      .value,
                  );

                void slugRegistration.onChange(
                  event,
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

          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold"
            >
              وصف الكتاب
            </label>

            <textarea
              id="description"
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

          <div>
            <label
              htmlFor="category_id"
              className="mb-2 block text-sm font-semibold"
            >
              التصنيف
            </label>

            <select
              id="category_id"
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
                بدون تصنيف
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
              htmlFor="publisher"
              className="mb-2 block text-sm font-semibold"
            >
              الناشر
            </label>

            <input
              id="publisher"
              type="text"
              autoComplete="off"
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
              htmlFor="riwaya"
              className="mb-2 block text-sm font-semibold"
            >
              الرواية
            </label>

            <input
              id="riwaya"
              type="text"
              list="riwaya-suggestions"
              autoComplete="off"
              placeholder="اختياري"
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
                  riwaya,
                ) => (
                  <option
                    key={
                      riwaya
                    }
                    value={
                      riwaya
                    }
                  />
                ),
              )}
            </datalist>

            <p className="mt-2 text-xs text-muted-foreground">
              حفص عن عاصم، ورش عن
              نافع، قالون عن نافع.
            </p>

            {errors.riwaya ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.riwaya
                    .message
                }
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            السعر والمخزون
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold"
            >
              السعر
            </label>

            <input
              id="price"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className={
                fieldClassName(
                  Boolean(
                    errors.price,
                  ),
                )
              }
              {...register(
                "price",
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            {errors.price ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.price
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="stock"
              className="mb-2 block text-sm font-semibold"
            >
              المخزون
            </label>

            <input
              id="stock"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className={
                fieldClassName(
                  Boolean(
                    errors.stock,
                  ),
                )
              }
              {...register(
                "stock",
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            {errors.stock ? (
              <p className="mt-2 text-xs text-destructive">
                {
                  errors.stock
                    .message
                }
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">
              صور الكتاب
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              JPG أو PNG أو WebP،
              أقل من 3 ميغابايت،
              بحد أقصى 3 صور.
              الصورة الأولى هي
              الرئيسية.
            </p>
          </div>

          <label
            className={`inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors ${
              isUploading ||
              imageLimitReached
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:bg-muted"
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

            {isUploading
              ? "جار رفع الصور..."
              : imageLimitReached
                ? "اكتمل الحد الأقصى"
                : "إضافة صور"}

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImagesSelected
              }
              disabled={
                isUploading ||
                imageLimitReached
              }
              className="sr-only"
            />
          </label>
        </div>

        {images.length ===
        0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
            <ImagePlus
              className="mb-3 size-7 text-muted-foreground"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold">
              لا توجد صور بعد
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              يمكنك إضافة حتى 3 صور
              للكتاب.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map(
              (
                imageUrl,
                index,
              ) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-border bg-muted"
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={
                        imageUrl
                      }
                      alt={`صورة الكتاب ${
                        index +
                        1
                      }`}
                      className="size-full object-cover"
                    />
                  </div>

                  {index ===
                  0 ? (
                    <span className="absolute start-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                      الصورة الرئيسية
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      void removeImage(
                        index,
                      );
                    }}
                    aria-label="حذف الصورة"
                    className="absolute end-2 top-2 inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
                  >
                    <X
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>

                  <div className="absolute bottom-2 start-2 flex gap-1 rounded-xl bg-background/90 p-1 shadow-sm backdrop-blur">
                    <button
                      type="button"
                      disabled={
                        index ===
                        0
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          index -
                            1,
                        )
                      }
                      aria-label="تحريك الصورة للأمام"
                      className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
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
                          1
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          index +
                            1,
                        )
                      }
                      aria-label="تحريك الصورة للخلف"
                      className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ArrowDown
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {images.length} /{" "}
          {
            MAX_PRODUCT_IMAGE_COUNT
          }{" "}
          صور
        </p>

        {errors.images ? (
          <p className="mt-2 text-xs text-destructive">
            {
              errors.images
                .message
            }
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            الظهور في المتجر
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-primary"
              {...register(
                "is_active",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                كتاب نشط
              </span>

              <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                يظهر الكتاب للعملاء
                في المتجر عندما يكون
                نشطاً.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-primary"
              {...register(
                "is_featured",
              )}
            />

            <span>
              <span className="block text-sm font-semibold">
                كتاب مميز
              </span>

              <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                يظهر ضمن قسم الأكثر
                طلباً في الصفحة
                الرئيسية.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
          <button
            type="submit"
            disabled={
              isBusy
            }
            className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isBusy ? (
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

            {isUploading
              ? "جار رفع الصور..."
              : isSubmitting
                ? "جار الحفظ..."
                : mode ===
                    "create"
                  ? "إنشاء الكتاب"
                  : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </form>
  );
}