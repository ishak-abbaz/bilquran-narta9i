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
import {
  toast,
} from "sonner";

import {
  sendContactMessage,
} from "@/app/(store)/contact/actions";

type ContactActionState = {
  success: boolean;
  message: string;

  errors: {
    name?: string[];
    phone?: string[];
    message?: string[];
  };
};

const initialContactActionState:
  ContactActionState = {
  success: false,
  message: "",
  errors: {},
};

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

  const errors =
    state?.errors ??
    {};

  useEffect(() => {
    if (
      !state?.message
    ) {
      return;
    }

    if (
      state.success
    ) {
      toast.success(
        state.message,
      );

      formRef.current?.reset();

      return;
    }

    toast.error(
      state.message,
    );
  }, [
    state.message,
    state.success,
  ]);

  return (
    <form
      ref={formRef}
      action={
        formAction
      }
      className="w-full rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-8"
    >
      {/* Honeypot anti-spam field */}
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

      <div className="space-y-6">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-semibold"
          >
            الاسم الكامل
          </label>

          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            disabled={
              isPending
            }
            placeholder="اكتب اسمك الكامل"
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />

          {errors.name?.[0] ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              {
                errors
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
            inputMode="tel"
            autoComplete="tel"
            disabled={
              isPending
            }
            placeholder="0550 00 00 00"
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-end text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />

          {errors.phone?.[0] ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              {
                errors
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
            rows={8}
            disabled={
              isPending
            }
            placeholder="اكتب رسالتك هنا..."
            className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />

          {errors.message?.[0] ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              {
                errors
                  .message[0]
              }
            </p>
          ) : null}
        </div>
      </div>

      {state.message &&
      !state.success ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {
            state.message
          }
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          isPending
        }
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />

            جار إرسال الرسالة...
          </>
        ) : (
          <>
            <Send
              className="size-4"
              aria-hidden="true"
            />

            إرسال الرسالة
          </>
        )}
      </button>
    </form>
  );
}