import { OrderSuccessClient } from "@/components/order/order-success-client";

type OrderSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;

  const orderNumber =
    params.order?.trim() ||
    "غير متوفر";

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-border p-8 text-center">
        <OrderSuccessClient
          orderNumber={orderNumber}
        />
      </section>
    </main>
  );
}