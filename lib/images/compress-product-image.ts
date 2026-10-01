"use client";

export const MAX_PRODUCT_IMAGE_BYTES =
  3 * 1024 * 1024;

export const MAX_PRODUCT_IMAGE_COUNT = 10;

export const ALLOWED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MAX_IMAGE_DIMENSION = 1800;

function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error(
          "تعذر قراءة ملف الصورة.",
        ),
      );
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "تعذر ضغط الصورة.",
            ),
          );

          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

export async function prepareProductImage(
  file: File,
): Promise<File> {
  if (
    !ALLOWED_PRODUCT_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error(
      "الصيغ المسموحة هي JPG وPNG وWebP فقط.",
    );
  }

  if (
    file.size >
    MAX_PRODUCT_IMAGE_BYTES
  ) {
    throw new Error(
      "حجم الصورة يجب ألا يتجاوز 3 ميغابايت.",
    );
  }

  const image = await loadImage(file);

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / image.width,
    MAX_IMAGE_DIMENSION / image.height,
  );

  const width = Math.max(
    1,
    Math.round(image.width * scale),
  );

  const height = Math.max(
    1,
    Math.round(image.height * scale),
  );

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "المتصفح لا يدعم معالجة الصور.",
    );
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  let blob = await canvasToBlob(
    canvas,
    0.82,
  );

  if (
    blob.size >
    MAX_PRODUCT_IMAGE_BYTES
  ) {
    blob = await canvasToBlob(
      canvas,
      0.65,
    );
  }

  if (
    blob.size >
    MAX_PRODUCT_IMAGE_BYTES
  ) {
    throw new Error(
      "تعذر ضغط الصورة إلى أقل من 3 ميغابايت.",
    );
  }

  const originalBaseName =
    file.name.replace(/\.[^.]+$/, "");

  return new File(
    [blob],
    `${originalBaseName}.webp`,
    {
      type: "image/webp",
      lastModified: Date.now(),
    },
  );
}