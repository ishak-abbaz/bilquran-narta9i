import Link from "next/link";

import {
  getOrders,
} from "@/lib/data/orders";

import StatusBadge from "@/components/admin/status-badge";


function formatDZD(value:number){
  return new Intl.NumberFormat("ar-DZ")
    .format(value)
    + " د.ج";
}


export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {

  const params = await searchParams;


  const page =
    Number(params.page ?? "1");


  const {
    orders,
    totalPages,
  } = await getOrders({
    page,
    search: params.search ?? "",
    status: params.status ?? "all",
  });



  return (
    <section className="space-y-6">


      <h1 className="text-3xl font-semibold">
        الطلبات
      </h1>



      <form className="flex flex-wrap gap-3">

        <input
          name="search"
          defaultValue={params.search}
          placeholder="بحث بالاسم أو الهاتف"
          className="h-10 rounded-md border px-3"
        />


        <select
          name="status"
          defaultValue={params.status}
          className="h-10 rounded-md border px-3"
        >

          <option value="all">
            كل الحالات
          </option>

          <option value="pending">
            قيد الانتظار
          </option>

          <option value="confirmed">
            مؤكد
          </option>

          <option value="shipped">
            تم الشحن
          </option>

          <option value="delivered">
            تم التوصيل
          </option>

          <option value="cancelled">
            ملغي
          </option>

        </select>


        <button className="rounded-md bg-primary px-5 text-primary-foreground">
          بحث
        </button>

      </form>



      <div className="rounded-xl border overflow-hidden">

        <table className="w-full text-sm">

          <thead className="border-b bg-muted">

            <tr>
              <th className="p-4 text-start">
                الرقم
              </th>

              <th className="p-4 text-start">
                العميل
              </th>

              <th className="p-4 text-start">
                الهاتف
              </th>

              <th className="p-4 text-start">
                الولاية
              </th>

              <th className="p-4 text-start">
                المجموع
              </th>

              <th className="p-4 text-start">
                الحالة
              </th>

              <th/>
            </tr>

          </thead>


          <tbody>

          {orders.map(order=>(

            <tr
              key={order.id}
              className="border-b"
            >

              <td className="p-4">
                {order.order_number}
              </td>

              <td className="p-4">
                {order.customer_name}
              </td>

              <td className="p-4">
                {order.phone}
              </td>

              <td className="p-4">
                {order.wilaya}
              </td>

              <td className="p-4">
                {formatDZD(order.total)}
              </td>

              <td className="p-4">
                <StatusBadge
                  status={order.status}
                />
              </td>

              <td className="p-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="underline"
                >
                  عرض
                </Link>
              </td>

            </tr>

          ))}

          </tbody>

        </table>

      </div>


      <div className="flex gap-3">

        {page > 1 && (
          <Link
            href={`?page=${page-1}`}
            className="border px-4 py-2 rounded"
          >
            السابق
          </Link>
        )}


        {page < totalPages && (
          <Link
            href={`?page=${page+1}`}
            className="border px-4 py-2 rounded"
          >
            التالي
          </Link>
        )}

      </div>


    </section>
  );
}