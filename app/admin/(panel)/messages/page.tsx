import {
  Inbox,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ContactMessage = {
  id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string | null;
};

function formatMessageDate(
  value: string | null,
) {
  if (!value) {
    return "تاريخ غير متوفر";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "تاريخ غير متوفر";
  }

  return new Intl.DateTimeFormat(
    "ar-DZ",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export default async function AdminMessagesPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("contact_messages")
      .select(
        `
          id,
          name,
          phone,
          message,
          created_at
        `,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(200);

  if (error) {
    console.error(
      "فشل تحميل الرسائل:",
      error,
    );

    throw new Error(
      "تعذر تحميل الرسائل.",
    );
  }

  const messages =
    (data ??
      []) as ContactMessage[];

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            صندوق الوارد
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            الرسائل
          </h1>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            رسائل العملاء المرسلة من
            صفحة التواصل.
          </p>
        </header>

        {messages.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-white px-6 text-center shadow-sm dark:bg-card">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <Inbox
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h2 className="text-lg font-bold">
              لا توجد رسائل
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              ستظهر رسائل العملاء هنا
              عند إرسال نموذج التواصل.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {messages.map(
              (message) => (
                <article
                  key={message.id}
                  className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />

                        <h2 className="font-bold">
                          {message.name ||
                            "بدون اسم"}
                        </h2>
                      </div>

                      {message.phone ? (
                        <a
                          href={`tel:${message.phone}`}
                          dir="ltr"
                          className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Phone
                            className="size-4"
                            aria-hidden="true"
                          />
                          {
                            message.phone
                          }
                        </a>
                      ) : null}
                    </div>

                    <time
                      dateTime={
                        message.created_at ??
                        undefined
                      }
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatMessageDate(
                        message.created_at,
                      )}
                    </time>
                  </div>

                  <div className="mt-5 border-t border-border pt-5">
                    <div className="flex items-start gap-3">
                      <Mail
                        className="mt-1 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <p className="whitespace-pre-wrap break-words text-sm leading-8">
                        {message.message ||
                          "لا توجد رسالة."}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}