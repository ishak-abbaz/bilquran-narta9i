import { OrderSuccessClient } from "@/components/order/order-success-client";

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const orderNumber =
    params.order ?? "غير متوفر";

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border p-8 text-center">

        <h1 className="mb-5 text-3xl font-bold">
          شكراً لك على طلبك
        </h1>

        <p className="mb-6 text-muted-foreground">
          تم استلام طلبك بنجاح.
          سنتصل بك هاتفياً لتأكيد الطلب قبل الشحن.
        </p>


        <div className="mb-8 rounded-xl bg-muted p-5">
          <p className="mb-2 text-sm text-muted-foreground">
            رقم الطلب
          </p>

          <p className="text-xl font-bold">
            {orderNumber}
          </p>
        </div>


        <OrderSuccessClient />

      </section>
    </main>
  );
}