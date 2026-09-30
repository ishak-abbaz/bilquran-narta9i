import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.size === item.size &&
              cartItem.color === item.color,
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.size === item.size &&
                cartItem.color === item.color
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + item.quantity,
                    }
                  : cartItem,
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.size === size &&
                item.color === color
              ),
          ),
        })),

      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) =>
                    !(
                      item.productId === productId &&
                      item.size === size &&
                      item.color === color
                    ),
                )
              : state.items.map((item) =>
                  item.productId === productId &&
                  item.size === size &&
                  item.color === color
                    ? { ...item, quantity }
                    : item,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "arabic-store-cart",
    },
  ),
);

export function getTotalItems(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getSubtotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

export function formatDZD(value: number) {
  return `${new Intl.NumberFormat("ar-DZ").format(value)} د.ج`;
}