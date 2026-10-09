"use server";

import "server-only";

import {
  redirect,
} from "next/navigation";
import {
  z,
} from "zod";

import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

const changePasswordSchema =
  z
    .object({
      currentPassword:
        z
          .string()
          .min(1),

      newPassword:
        z
          .string()
          .min(
            10,
            "كلمة المرور الجديدة قصيرة جداً.",
          )
          .max(
            128,
          ),

      confirmPassword:
        z.string(),
    })
    .refine(
      (
        values,
      ) =>
        values.newPassword ===
        values.confirmPassword,
      {
        path: [
          "confirmPassword",
        ],
      },
    );

export async function changeAdminPassword(
  formData: FormData,
) {
  const user =
    await requireAdmin();

  const parsed =
    changePasswordSchema.safeParse({
      currentPassword:
        formData.get(
          "currentPassword",
        ),

      newPassword:
        formData.get(
          "newPassword",
        ),

      confirmPassword:
        formData.get(
          "confirmPassword",
        ),
    });

  if (!parsed.success) {
    const mismatch =
      parsed.error.issues.some(
        (
          issue,
        ) =>
          issue.path.includes(
            "confirmPassword",
          ),
      );

    redirect(
      mismatch
        ? "/admin/account?error=mismatch"
        : "/admin/account?error=weak",
    );
  }

  if (!user.email) {
    redirect(
      "/admin/account?error=email",
    );
  }

  const supabase =
    await createClient();

  /*
   * Verify the current password before allowing
   * a normal authenticated session to replace it.
   */
  const {
    error:
      currentPasswordError,
  } =
    await supabase.auth.signInWithPassword({
      email:
        user.email,

      password:
        parsed.data
          .currentPassword,
    });

  if (
    currentPasswordError
  ) {
    redirect(
      "/admin/account?error=current",
    );
  }

  const {
    error:
      updateError,
  } =
    await supabase.auth.updateUser({
      password:
        parsed.data
          .newPassword,
    });

  if (updateError) {
    console.error(
      "فشل تغيير كلمة مرور الإدارة:",
      updateError,
    );

    redirect(
      "/admin/account?error=update",
    );
  }

  /*
   * Force a fresh login after changing credentials.
   */
  await supabase.auth.signOut();

  redirect(
    "/admin/login?password=changed",
  );
}