"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export async function loginAdmin(
  formData: FormData
) {

  const email =
    String(formData.get("email"));

  const password =
    String(formData.get("password"));


  const supabase =
    await createClient();


  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });


  if (error) {
    return {
      error:
        "بيانات الدخول غير صحيحة",
    };
  }


  redirect("/admin");
}



export async function logoutAdmin() {

  const supabase =
    await createClient();


  await supabase.auth.signOut();


  redirect("/admin/login");
}