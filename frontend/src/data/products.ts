
export interface Product {
  id: number | string;
  name: string;
  platform: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: string;
  image: string;
  description: string;
}

export interface SupabaseProductRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  platform: string | null;
  region: string | null;
  price: number | string;
  old_price: number | string | null;
  discount_percentage: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

// Convert a Supabase database product into our frontend Product format.
export function mapSupabaseProduct(
  row: SupabaseProductRow
): Product {
  const price = Number(row.price);
  const oldPrice = row.old_price
    ? Number(row.old_price)
    : price;

  const discountPercentage =
    row.discount_percentage ?? 0;

  const hasDiscount =
    oldPrice > price && discountPercentage > 0;

  return {
    id: row.id,
    name: row.title,
    platform: row.platform || "Other",
    category: row.category || "Other",
    price,
    oldPrice: hasDiscount ? oldPrice : price,
    discount: hasDiscount
      ? `-${discountPercentage}%`
      : "",
    image:
      row.image_url ||
      "https://placehold.co/400x500?text=Game",
    description:
      row.description || "No description available.",
  };
}

// Original local products. These can still be used elsewhere
// in the application until those sections are connected to Supabase.
export const products: Product[] = [
  {
    id: 1,
    name: "Cyberpunk 2077",
    platform: "PC",
    category: "Action",
    price: 19.99,
    oldPrice: 59.99,
    discount: "-67%",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
    description: "Explore a futuristic open-world RPG adventure.",
  },
  {
    id: 2,
    name: "Grand Theft Auto V",
    platform: "PC",
    category: "Action",
    price: 12.49,
    oldPrice: 29.99,
    discount: "-58%",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500",
    description: "Experience an open-world action adventure.",
  },
  {
    id: 3,
    name: "Elden Ring",
    platform: "PC",
    category: "Adventure",
    price: 34.99,
    oldPrice: 59.99,
    discount: "-42%",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
    description: "Discover a fantasy world filled with challenges.",
  },
  {
    id: 4,
    name: "Minecraft",
    platform: "PC",
    category: "Adventure",
    price: 18.99,
    oldPrice: 29.99,
    discount: "-37%",
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500",
    description: "Build, explore and create your own world.",
  },
];
