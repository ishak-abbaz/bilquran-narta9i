export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
};

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "هودي كلاسيكي أسود",
    slug: "black-classic-hoodie",
    price: 3900,
    image: "/products/hoodie-1.jpg",
    category: "hoodies",
  },
  {
    id: "2",
    name: "هودي أوفر سايز أبيض",
    slug: "oversize-white-hoodie",
    price: 4200,
    image: "/products/hoodie-2.jpg",
    category: "hoodies",
  },
  {
    id: "3",
    name: "تيشرت بولو فاخر",
    slug: "premium-polo-shirt",
    price: 3100,
    image: "/products/polo-1.jpg",
    category: "t-shirts",
  },
  {
    id: "4",
    name: "جينز واسع عصري",
    slug: "baggy-jeans",
    price: 5500,
    image: "/products/jeans-1.jpg",
    category: "pants",
  },
];