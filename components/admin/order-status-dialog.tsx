"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { updateOrderStatus } from "@/app/admin/(panel)/orders/actions";
import StatusBadge from "./status-badge";


export default function OrderStatusDialog({
  order,
  open,
  onOpenChange,
}: {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {

  const [status, setStatus] = useState(order.status);


  async function changeStatus(value: string) {
    setStatus(value);

    await updateOrderStatus(
      order.id,
      value
    );
  }


  const whatsapp =
    `https://wa.me/213${order.phone.replace(/^0/, "")}`;


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent className="max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle>
            تفاصيل الطلب
          </DialogTitle>
        </DialogHeader>


        <div className="space-y-5">


          <div>
            <p>
              العميل: {order.customer_name}
            </p>

            <a
              href={`tel:${order.phone}`}
              className="block text-sm underline"
            >
              {order.phone}
            </a>


            <a
              href={whatsapp}
              target="_blank"
              className="block text-sm underline"
            >
              واتساب
            </a>

          </div>


          <div>
            العنوان:
            <p>
              {order.wilaya}، {order.address}
            </p>
          </div>


          {order.notes && (
            <p>
              ملاحظات:
              {order.notes}
            </p>
          )}



          <div className="space-y-3">

            {order.order_items.map(
              (item: any) => (

              <div
                key={item.id}
                className="rounded-lg border p-3"
              >

                <p>
                  {item.product_name}
                </p>

                <p className="text-sm">
                  المقاس: {item.size}
                </p>

                <p className="text-sm">
                  اللون: {item.color}
                </p>

                <p className="text-sm">
                  الكمية: {item.quantity}
                </p>

                <p className="text-sm">
                  السعر: {item.unit_price} د.ج
                </p>

              </div>

            ))}

          </div>


          <div>
            المجموع الفرعي:
            {order.subtotal} د.ج
          </div>

          <div>
            التوصيل:
            {order.delivery_fee} د.ج
          </div>

          <div className="font-semibold">
            الإجمالي:
            {order.total} د.ج
          </div>


          <select
            value={status}
            onChange={(e) =>
              changeStatus(e.target.value)
            }
            className="h-10 w-full rounded-md border px-3"
          >
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


          <StatusBadge status={status}/>


        </div>

      </DialogContent>

    </Dialog>
  );
}