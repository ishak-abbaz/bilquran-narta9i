"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";


const schema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),

  phone: z
    .string()
    .min(8, "رقم الهاتف غير صالح"),

  message: z
    .string()
    .min(10, "الرسالة قصيرة جداً"),
});


type FormData = z.infer<typeof schema>;


export default function ContactForm() {

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });


  async function onSubmit(data: FormData) {

    console.log(data);

    toast.success("تم إرسال رسالتك بنجاح");

    reset();
  }


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >

      <div>
        <input
          {...register("name")}
          placeholder="الاسم"
          className="w-full rounded-2xl border border-black/10 bg-transparent px-5 py-3 outline-none focus:border-black dark:border-white/20"
        />

        {errors.name && (
          <p className="mt-2 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>


      <div>
        <input
          {...register("phone")}
          placeholder="رقم الهاتف"
          className="w-full rounded-2xl border border-black/10 bg-transparent px-5 py-3 outline-none focus:border-black dark:border-white/20"
        />

        {errors.phone && (
          <p className="mt-2 text-sm text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>


      <div>
        <textarea
          {...register("message")}
          placeholder="رسالتك"
          rows={5}
          className="w-full resize-none rounded-2xl border border-black/10 bg-transparent px-5 py-3 outline-none focus:border-black dark:border-white/20"
        />

        {errors.message && (
          <p className="mt-2 text-sm text-red-500">
            {errors.message.message}
          </p>
        )}
      </div>


      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded-full bg-black py-3 font-semibold text-white transition hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        إرسال
      </button>

    </form>
  );
}