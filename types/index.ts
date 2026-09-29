export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  wilaya: string;
  address: string;
  notes: string | null;
  status: OrderStatus;
  subtotal: number | null;
  delivery_fee: number | null;
  total: number | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string | null;
  unit_price: number | null;
  quantity: number | null;
  size: string | null;
  color: string | null;
};

export type Settings = {
  id: number;
  store_name: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
  free_delivery_threshold: number | null;
};

export type DeliveryPrice = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};