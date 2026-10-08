"use client";

import {
  MapPin,
  Plus,
  Save,
  Trash2,
  Truck,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";
import {
  toast,
} from "sonner";

import {
  createDeliveryWilaya,
  deleteDeliveryWilaya,
  updateDeliveryWilaya,
} from "@/app/admin/(panel)/settings/actions";
import {
  Button,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DeliveryPriceRow = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

type EditableDeliveryRow =
  DeliveryPriceRow & {
    original_wilaya_code:
      number;
  };

type SettingsTabsProps = {
  initialDeliveryPrices:
    DeliveryPriceRow[];
};

type NewWilayaForm = {
  wilaya_code: string;
  wilaya_name: string;
  home_price: string;
  desk_price: string;
};

const EMPTY_NEW_WILAYA:
  NewWilayaForm = {
  wilaya_code: "",
  wilaya_name: "",
  home_price: "",
  desk_price: "",
};

function inputClassName() {
  return "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function normalizeInteger(
  value: string,
) {
  if (
    value.trim() ===
    ""
  ) {
    return 0;
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number,
    )
  ) {
    return 0;
  }

  return Math.trunc(
    number,
  );
}

export function SettingsTabs({
  initialDeliveryPrices,
}: SettingsTabsProps) {
  const [
    rows,
    setRows,
  ] = useState<
    EditableDeliveryRow[]
  >(
    initialDeliveryPrices.map(
      (
        row,
      ) => ({
        ...row,

        original_wilaya_code:
          row.wilaya_code,
      }),
    ),
  );

  const [
    newWilaya,
    setNewWilaya,
  ] =
    useState<NewWilayaForm>(
      EMPTY_NEW_WILAYA,
    );

  const [
    savingCode,
    setSavingCode,
  ] = useState<
    number | null
  >(null);

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<
    EditableDeliveryRow | null
  >(null);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function updateRow(
    originalCode: number,
    field:
      | "wilaya_code"
      | "wilaya_name"
      | "home_price"
      | "desk_price",
    value:
      string,
  ) {
    setRows(
      (
        current,
      ) =>
        current.map(
          (
            row,
          ) => {
            if (
              row.original_wilaya_code !==
              originalCode
            ) {
              return row;
            }

            if (
              field ===
              "wilaya_name"
            ) {
              return {
                ...row,

                wilaya_name:
                  value,
              };
            }

            return {
              ...row,

              [field]:
                normalizeInteger(
                  value,
                ),
            };
          },
        ),
    );
  }

  function handleAdd() {
    const wilayaCode =
      normalizeInteger(
        newWilaya.wilaya_code,
      );

    const wilayaName =
      newWilaya.wilaya_name.trim();

    const homePrice =
      normalizeInteger(
        newWilaya.home_price,
      );

    const deskPrice =
      normalizeInteger(
        newWilaya.desk_price,
      );

    if (
      wilayaCode <=
      0
    ) {
      toast.error(
        "أدخل رمز ولاية صالحاً.",
      );

      return;
    }

    if (
      wilayaName.length ===
      0
    ) {
      toast.error(
        "أدخل اسم الولاية.",
      );

      return;
    }

    if (
      homePrice <
        0 ||
      deskPrice <
        0
    ) {
      toast.error(
        "أسعار التوصيل لا يمكن أن تكون سالبة.",
      );

      return;
    }

    setIsAdding(
      true,
    );

    startTransition(
      async () => {
        try {
          const result =
            await createDeliveryWilaya({
              wilaya_code:
                wilayaCode,

              wilaya_name:
                wilayaName,

              home_price:
                homePrice,

              desk_price:
                deskPrice,
            });

          if (
            !result.success
          ) {
            toast.error(
              result.message,
            );

            return;
          }

          setRows(
            (
              current,
            ) =>
              [
                ...current,
                {
                  wilaya_code:
                    wilayaCode,

                  wilaya_name:
                    wilayaName,

                  home_price:
                    homePrice,

                  desk_price:
                    deskPrice,

                  original_wilaya_code:
                    wilayaCode,
                },
              ].sort(
                (
                  first,
                  second,
                ) =>
                  first.wilaya_code -
                  second.wilaya_code,
              ),
          );

          setNewWilaya(
            EMPTY_NEW_WILAYA,
          );

          toast.success(
            result.message,
          );
        } finally {
          setIsAdding(
            false,
          );
        }
      },
    );
  }

  function handleSave(
    row:
      EditableDeliveryRow,
  ) {
    setSavingCode(
      row.original_wilaya_code,
    );

    startTransition(
      async () => {
        try {
          const result =
            await updateDeliveryWilaya(
              row.original_wilaya_code,
              {
                wilaya_code:
                  row.wilaya_code,

                wilaya_name:
                  row.wilaya_name,

                home_price:
                  row.home_price,

                desk_price:
                  row.desk_price,
              },
            );

          if (
            !result.success
          ) {
            toast.error(
              result.message,
            );

            return;
          }

          setRows(
            (
              current,
            ) =>
              current
                .map(
                  (
                    item,
                  ) =>
                    item.original_wilaya_code ===
                    row.original_wilaya_code
                      ? {
                          ...row,

                          original_wilaya_code:
                            row.wilaya_code,
                        }
                      : item,
                )
                .sort(
                  (
                    first,
                    second,
                  ) =>
                    first.wilaya_code -
                    second.wilaya_code,
                ),
          );

          toast.success(
            result.message,
          );
        } finally {
          setSavingCode(
            null,
          );
        }
      },
    );
  }

  function handleDelete() {
    if (
      !deleteTarget
    ) {
      return;
    }

    const target =
      deleteTarget;

    startTransition(
      async () => {
        const result =
          await deleteDeliveryWilaya(
            target.original_wilaya_code,
          );

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        setRows(
          (
            current,
          ) =>
            current.filter(
              (
                row,
              ) =>
                row.original_wilaya_code !==
                target.original_wilaya_code,
            ),
        );

        setDeleteTarget(
          null,
        );

        toast.success(
          result.message,
        );
      },
    );
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus
                className="size-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                إضافة ولاية
              </h2>

              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                لا توجد قائمة ثابتة.
                يمكنك إضافة أي ولاية
                جديدة في المستقبل.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[160px_1fr_200px_200px_auto] xl:items-end">
            <div>
              <label
                htmlFor="new-wilaya-code"
                className="mb-2 block text-sm font-semibold"
              >
                الرمز
              </label>

              <input
                id="new-wilaya-code"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={
                  newWilaya.wilaya_code
                }
                onChange={(
                  event,
                ) =>
                  setNewWilaya(
                    (
                      current,
                    ) => ({
                      ...current,

                      wilaya_code:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="69"
                className={
                  inputClassName()
                }
              />
            </div>

            <div>
              <label
                htmlFor="new-wilaya-name"
                className="mb-2 block text-sm font-semibold"
              >
                اسم الولاية
              </label>

              <input
                id="new-wilaya-name"
                type="text"
                value={
                  newWilaya.wilaya_name
                }
                onChange={(
                  event,
                ) =>
                  setNewWilaya(
                    (
                      current,
                    ) => ({
                      ...current,

                      wilaya_name:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="اسم الولاية"
                className={
                  inputClassName()
                }
              />
            </div>

            <div>
              <label
                htmlFor="new-home-price"
                className="mb-2 block text-sm font-semibold"
              >
                سعر المنزل
              </label>

              <input
                id="new-home-price"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={
                  newWilaya.home_price
                }
                onChange={(
                  event,
                ) =>
                  setNewWilaya(
                    (
                      current,
                    ) => ({
                      ...current,

                      home_price:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="0"
                className={
                  inputClassName()
                }
              />
            </div>

            <div>
              <label
                htmlFor="new-desk-price"
                className="mb-2 block text-sm font-semibold"
              >
                سعر المكتب
              </label>

              <input
                id="new-desk-price"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={
                  newWilaya.desk_price
                }
                onChange={(
                  event,
                ) =>
                  setNewWilaya(
                    (
                      current,
                    ) => ({
                      ...current,

                      desk_price:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="0"
                className={
                  inputClassName()
                }
              />
            </div>

            <Button
              type="button"
              disabled={
                isAdding ||
                isPending
              }
              onClick={
                handleAdd
              }
            >
              <Plus
                className="size-4"
                aria-hidden="true"
              />

              {isAdding
                ? "جار الإضافة..."
                : "إضافة"}
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  الولايات المفعلة
                </h2>

                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  عدّل الرمز أو الاسم
                  أو الأسعار ثم اضغط
                  حفظ.
                </p>
              </div>
            </div>

            <div className="rounded-full bg-muted px-4 py-2 text-sm font-semibold">
              {
                rows.length
              }{" "}
              ولاية
            </div>
          </div>

          {rows.length ===
          0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
              <MapPin
                className="mb-4 size-8 text-muted-foreground"
                aria-hidden="true"
              />

              <h3 className="font-semibold">
                لا توجد ولايات
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                أضف أول ولاية
                للتوصيل من النموذج
                أعلاه.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="w-32 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الرمز
                    </th>

                    <th className="px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الولاية
                    </th>

                    <th className="w-52 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      المنزل
                    </th>

                    <th className="w-52 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      المكتب
                    </th>

                    <th className="w-56 px-5 py-4 text-end text-xs font-semibold text-muted-foreground">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map(
                    (
                      row,
                    ) => (
                      <tr
                        key={
                          row.original_wilaya_code
                        }
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            value={
                              row.wilaya_code
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                row.original_wilaya_code,
                                "wilaya_code",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={
                              inputClassName()
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="text"
                            value={
                              row.wilaya_name
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                row.original_wilaya_code,
                                "wilaya_name",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={
                              inputClassName()
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            value={
                              row.home_price
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                row.original_wilaya_code,
                                "home_price",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={
                              inputClassName()
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            value={
                              row.desk_price
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                row.original_wilaya_code,
                                "desk_price",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className={
                              inputClassName()
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={
                                isPending
                              }
                              onClick={() =>
                                handleSave(
                                  row,
                                )
                              }
                            >
                              <Save
                                className="size-4"
                                aria-hidden="true"
                              />

                              {savingCode ===
                              row.original_wilaya_code
                                ? "جار الحفظ..."
                                : "حفظ"}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={
                                isPending
                              }
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                setDeleteTarget(
                                  row,
                                )
                              }
                            >
                              <Trash2
                                className="size-4"
                                aria-hidden="true"
                              />

                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={
          Boolean(
            deleteTarget,
          )
        }
        onOpenChange={(
          open,
        ) => {
          if (
            !open &&
            !isPending
          ) {
            setDeleteTarget(
              null,
            );
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              حذف ولاية التوصيل
            </DialogTitle>

            <DialogDescription>
              {deleteTarget
                ? `هل تريد حذف ولاية ${deleteTarget.wilaya_name}؟`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
            بعد الحذف لن تظهر هذه
            الولاية للعملاء عند
            إنشاء طلب جديد.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                isPending
              }
              onClick={() =>
                setDeleteTarget(
                  null,
                )
              }
            >
              تراجع
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={
                isPending
              }
              onClick={
                handleDelete
              }
            >
              {isPending
                ? "جار الحذف..."
                : "حذف الولاية"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}