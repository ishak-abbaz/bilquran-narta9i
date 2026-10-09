"use server";

import "server-only";

import {
  redirect,
} from "next/navigation";
import {
  z,
} from "zod";

import {
  createClient,
} from "@/lib/supabase/server";

const loginSchema =
  z.object({
    email:
      z
        .string()
        .trim()
        .email(),

    password:
      z
        .string()
        .min(1),
  });

export async function loginAdmin(
  formData: FormData,
) {
  const parsed =
    loginSchema.safeParse({
      email:
        formData.get(
          "email",
        ),

      password:
        formData.get(
          "password",
        ),
    });

  if (!parsed.success) {
    redirect(
      "/admin/login?error=invalid",
    );
  }

  const supabase =
    await createClient();

  const {
    error: loginError,
  } =
    await supabase.auth.signInWithPassword({
      email:
        parsed.data.email,

      password:
        parsed.data.password,
    });

  if (loginError) {
    redirect(
      "/admin/login?error=invalid",
    );
  }

  const {
    data: isAdmin,
    error: adminError,
  } = await supabase.rpc(
    "is_admin",
  );

  if (
    adminError ||
    !isAdmin
  ) {
    await supabase.auth.signOut();

    redirect(
      "/admin/login?error=unauthorized",
    );
  }

  redirect(
    "/admin",
  );
}

export async function logoutAdmin() {
  const supabase =
    await createClient();

  await supabase.auth.signOut();

  redirect(
    "/admin/login",
  );
}