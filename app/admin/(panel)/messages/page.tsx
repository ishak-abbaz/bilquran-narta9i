import {
  Mail,
  Phone,
  User,
} from "lucide-react";

import MessageActions from "@/components/admin/message-actions";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

type ContactMessage = {
  id: string;

  name:
    | string
    | null;

  phone:
    | string
    | null;

  message:
    | string
    | null;

  created_at:
    | string
    | null;
};

function formatDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return "بدون تاريخ";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "بدون تاريخ";
  }

  return new Intl.DateTimeFormat(
    "ar-DZ",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    date,
  );
}

export default async function MessagesPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "contact_messages",
    )
    .select(`
      id,
      name,
      phone,
      message,
      created_at
    `)
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    console.error(
      "فشل تحميل رسائل العملاء:",
      error,
    );

    throw new Error(
      "تعذر تحميل الرسائل.",
    );
  }

  const messages =
    (
      data ??
      []
    ) as ContactMessage[];

  return (
    <section className="space-y-8">
      <header>
        <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
          صندوق الوارد
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          الرسائل
        </h1>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          رسائل العملاء المرسلة
          من صفحة التواصل.
        </p>
      </header>

      {messages.length ===
      0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Mail
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <h2 className="font-semibold">
            لا توجد رسائل
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            ستظهر رسائل العملاء
            هنا عند إرسالها من صفحة
            التواصل.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(
            (
              message,
            ) => {
              const name =
                message.name?.trim() ||
                "بدون اسم";

              const phone =
                message.phone?.trim() ||
                "غير متوفر";

              const content =
                message.message?.trim() ||
                "رسالة فارغة";

              const createdAtLabel =
                formatDate(
                  message.created_at,
                );

              return (
                <article
                  key={
                    message.id
                  }
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div className="flex items-center gap-2">
                          <User
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />

                          <p className="font-bold">
                            {
                              name
                            }
                          </p>
                        </div>

                        <a
                          href={
                            phone ===
                            "غير متوفر"
                              ? undefined
                              : `tel:${phone}`
                          }
                          dir="ltr"
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Phone
                            className="size-4"
                            aria-hidden="true"
                          />

                          {
                            phone
                          }
                        </a>

                        <p className="text-xs text-muted-foreground">
                          {
                            createdAtLabel
                          }
                        </p>
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                          {
                            content
                          }
                        </p>
                      </div>
                    </div>

                    <MessageActions
                      message={{
                        id:
                          message.id,

                        name,

                        phone,

                        message:
                          content,
                      }}
                      createdAtLabel={
                        createdAtLabel
                      }
                    />
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}