type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const statusConfig = {
  pending: {
    label: "قيد الانتظار",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },

  confirmed: {
    label: "مؤكد",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },

  shipped: {
    label: "تم الشحن",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },

  delivered: {
    label: "تم التوصيل",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },

  cancelled: {
    label: "ملغي",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

export default function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}