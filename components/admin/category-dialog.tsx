"use client";

import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  createBrowserClient,
} from "@supabase/ssr";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import {
  toast,
} from "sonner";

import {
  createCategory,
  updateCategory,
} from "@/app/admin/(panel)/categories/actions";
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
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/categories/category-schema";
import {
  prepareProductImage,
} from "@/lib/images/compress-product-image";
import {
  arabicSafeSlug,
} from "@/lib/products/slug";

const MAX_CATEGORY_IMAGE_BYTES =
  2 * 1024 * 1024;

const ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

type EditableCategory = {
  id: string;
  name: string;
  slug: string;
  image_url:
    | string
    | null;
};

type CategoryDialogProps = {
  category?:
    EditableCategory;
};

function createStorageClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    throw new Error(
      "إعدادات Supabase العامة غير مكتملة.",
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
}

function getDefaultValues(
  category?:
    EditableCategory,
): CategoryFormValues {
  return {
    name:
      category?.name ??
      "",

    slug:
      category?.slug ??
      "",

    imageUrl:
      category
        ?.image_url ??
      null,
  };
}

export default function CategoryDialog({
  category,
}: CategoryDialogProps) {
  const router =
    useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    imageFile,
    setImageFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string | null
  >(
    category?.image_url ??
      null,
  );

  const [
    slugEdited,
    setSlugEdited,
  ] = useState(
    Boolean(category),
  );

  const [
    imageError,
    setImageError,
  ] = useState("");

  const [
    serverError,
    setServerError,
  ] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CategoryFormValues>({
    resolver:
      zodResolver(
        categoryFormSchema,
      ),

    defaultValues:
      getDefaultValues(
        category,
      ),
  });

  const name =
    watch("name");

  useEffect(() => {
    if (
      !open ||
      category ||
      slugEdited
    ) {
      return;
    }

    setValue(
      "slug",
      arabicSafeSlug(
        name,
      ),
      {
        shouldValidate:
          true,
      },
    );
  }, [
    category,
    name,
    open,
    setValue,
    slugEdited,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      getDefaultValues(
        category,
      ),
    );

    setImageFile(
      null,
    );

    setPreviewUrl(
      category
        ?.image_url ??
        null,
    );

    setSlugEdited(
      Boolean(
        category,
      ),
    );

    setImageError("");
    setServerError("");
  }, [
    category,
    open,
    reset,
  ]);

  useEffect(() => {
    return () => {
      if (
        previewUrl?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [
    previewUrl,
  ]);

  async function handleImageChange(
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    setImageError("");

    if (
      !ALLOWED_TYPES.has(
        file.type,
      )
    ) {
      setImageError(
        "الصيغ المسموحة هي JPG وPNG وWebP فقط.",
      );

      return;
    }

    if (
      file.size >
      MAX_CATEGORY_IMAGE_BYTES
    ) {
      setImageError(
        "حجم الصورة يجب ألا يتجاوز 2 ميغابايت.",
      );

      return;
    }

    try {
      const prepared =
        await prepareProductImage(
          file,
        );

      if (
        prepared.size >
        MAX_CATEGORY_IMAGE_BYTES
      ) {
        setImageError(
          "تعذر ضغط الصورة إلى أقل من 2 ميغابايت.",
        );

        return;
      }

      setImageFile(
        prepared,
      );

      setPreviewUrl(
        URL.createObjectURL(
          prepared,
        ),
      );
    } catch (
      error
    ) {
      setImageError(
        error instanceof
          Error
          ? error.message
          : "تعذر تجهيز الصورة.",
      );
    }
  }

  function removeImage() {
    setImageFile(
      null,
    );

    setPreviewUrl(
      null,
    );

    setValue(
      "imageUrl",
      null,
      {
        shouldDirty:
          true,
      },
    );

    setImageError("");
  }

  async function uploadImage(
    file: File,
  ) {
    const supabase =
      createStorageClient();

    const path =
      `${crypto.randomUUID()}.webp`;

    const {
      error,
    } = await supabase
      .storage
      .from(
        "categories",
      )
      .upload(
        path,
        file,
        {
          contentType:
            "image/webp",

          cacheControl:
            "3600",

          upsert:
            false,
        },
      );

    if (error) {
      throw new Error(
        "تعذر رفع صورة التصنيف.",
      );
    }

    const {
      data,
    } = supabase
      .storage
      .from(
        "categories",
      )
      .getPublicUrl(
        path,
      );

    return {
      path,
      publicUrl:
        data.publicUrl,
    };
  }

  async function removeTemporaryUpload(
    path: string,
  ) {
    try {
      const supabase =
        createStorageClient();

      await supabase.storage
        .from(
          "categories",
        )
        .remove([
          path,
        ]);
    } catch (
      error
    ) {
      console.error(
        "تعذر تنظيف الصورة المؤقتة:",
        error,
      );
    }
  }

  async function onSubmit(
    values:
      CategoryFormValues,
  ) {
    setServerError("");

    let uploadedPath:
      | string
      | null = null;

    try {
      let nextImageUrl =
        values.imageUrl;

      if (
        imageFile
      ) {
        const uploaded =
          await uploadImage(
            imageFile,
          );

        uploadedPath =
          uploaded.path;

        nextImageUrl =
          uploaded.publicUrl;
      }

      const payload:
        CategoryFormValues =
        {
          name:
            values.name,

          slug:
            values.slug,

          imageUrl:
            nextImageUrl,
        };

      const result =
        category
          ? await updateCategory(
              category.id,
              payload,
            )
          : await createCategory(
              payload,
            );

      if (
        !result.success
      ) {
        if (
          uploadedPath
        ) {
          await removeTemporaryUpload(
            uploadedPath,
          );
        }

        setServerError(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      setOpen(false);

      router.refresh();
    } catch (
      error
    ) {
      if (
        uploadedPath
      ) {
        await removeTemporaryUpload(
          uploadedPath,
        );
      }

      const message =
        error instanceof
          Error
          ? error.message
          : "تعذر حفظ التصنيف.";

      setServerError(
        message,
      );
    }
  }

  const hasImage =
    Boolean(
      previewUrl,
    );

  return (
    <Dialog
      open={open}
      onOpenChange={
        (nextOpen) => {
          if (
            isSubmitting
          ) {
            return;
          }

          setOpen(
            nextOpen,
          );
        }
      }
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={
              category
                ? "outline"
                : "default"
            }
            size={
              category
                ? "sm"
                : "default"
            }
          />
        }
      >
        {category ? (
          <>
            <Pencil
              className="size-4"
              aria-hidden="true"
            />
            تعديل
          </>
        ) : (
          <>
            <ImagePlus
              className="size-4"
              aria-hidden="true"
            />
            إضافة تصنيف
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category
              ? "تعديل التصنيف"
              : "إضافة تصنيف"}
          </DialogTitle>

          <DialogDescription>
            أدخل اسم التصنيف
            والرابط المختصر
            والصورة الاختيارية.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-semibold"
            >
              اسم التصنيف
            </label>

            <input
              id="category-name"
              type="text"
              disabled={
                isSubmitting
              }
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register(
                "name",
              )}
            />

            {errors.name
              ?.message ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {
                  errors
                    .name
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="category-slug"
              className="mb-2 block text-sm font-semibold"
            >
              الرابط المختصر
            </label>

            <Controller
              control={
                control
              }
              name="slug"
              render={({
                field,
              }) => (
                <input
                  id="category-slug"
                  type="text"
                  dir="ltr"
                  disabled={
                    isSubmitting
                  }
                  value={
                    field.value
                  }
                  onBlur={
                    field.onBlur
                  }
                  ref={
                    field.ref
                  }
                  onChange={(
                    event,
                  ) => {
                    setSlugEdited(
                      true,
                    );

                    field.onChange(
                      arabicSafeSlug(
                        event
                          .target
                          .value,
                      ),
                    );
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-end text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
            />

            <p className="mt-2 text-xs text-muted-foreground">
              يتم إنشاؤه
              تلقائياً من الاسم،
              ويمكنك تعديله.
            </p>

            {errors.slug
              ?.message ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {
                  errors
                    .slug
                    .message
                }
              </p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              صورة التصنيف
            </p>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={
                handleImageChange
              }
            />

            {hasImage ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={
                      previewUrl ??
                      ""
                    }
                    alt="معاينة صورة التصنيف"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      fileInputRef
                        .current
                        ?.click()
                    }
                  >
                    <ImagePlus
                      className="size-4"
                      aria-hidden="true"
                    />
                    استبدال الصورة
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isSubmitting
                    }
                    onClick={
                      removeImage
                    }
                  >
                    <Trash2
                      className="size-4"
                      aria-hidden="true"
                    />
                    إزالة الصورة
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <ImagePlus
                  className="size-6"
                  aria-hidden="true"
                />

                <span>
                  اختيار صورة
                </span>

                <span className="text-xs">
                  JPG أو PNG أو
                  WebP، بحد أقصى
                  2 MB
                </span>
              </button>
            )}

            {imageError ? (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-destructive"
              >
                {
                  imageError
                }
              </p>
            ) : null}
          </div>

          {serverError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {
                serverError
              }
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={
                isSubmitting
              }
              onClick={() =>
                setOpen(false)
              }
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />

                  جار الحفظ...
                </>
              ) : category ? (
                "حفظ التعديلات"
              ) : (
                "إضافة التصنيف"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}