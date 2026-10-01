"use client";

import {
  Loader2,
  Send,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";

import {
  initialContactActionState,
  sendContactMessage,
} from "@/contact/actions";

export function ContactForm() {
  const formRef =
    useRef<HTMLFormElement>(
      null,
    );

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    sendContactMessage,
    initialContactActionState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(
        state.message,
      );

      formRef.current?.reset();
    } else {
      toast.error(
        state.message,
      );
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6"
    >
      <div
        className="absolute size-px overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="website">
          الموقع
        </label>

        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-semibold"
          >
            الاسم
          </label>

          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            disabled={isPending}
            placeholder="اسمك الكامل"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />

          {state.errors.name?.[0] ? (
            <p className="mt-2 text-xs text-destructive">
              {
                state.errors
                  .name[0]
              }
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="mb-2 block text-sm font-semibold"
          >
            رقم الهاتف
          </label>

          <input
            id="contact-phone"
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            disabled={isPending}
            placeholder="0550 00 00 00"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-end text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />

          {state.errors.phone?.[0] ? (
            <p className="mt-2 text-xs text-destructive">
              {
                state.errors
                  .phone[0]
              }
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-2 block text-sm font-semibold"
          >
            الرسالة
          </label>

          <textarea
            id="contact-message"
            name="message"
            rows={7}
            disabled={isPending}
            placeholder="كيف يمكننا مساعدتك؟"
            className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />

          {state.errors.message?.[0] ? (
            <p className="mt-2 text-xs text-destructive">
              {
                state.errors
                  .message[0]
              }
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
      >
        {isPending ? (
          <Loader2
            className="size-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Send
            className="size-4"
            aria-hidden="true"
          />
        )}

        {isPending
          ? "جار الإرسال..."
          : "إرسال الرسالة"}
      </button>
    </form>
  );
}