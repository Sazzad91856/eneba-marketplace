
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  offerId?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface CartOffer {
  offerId: string;
  sellerId: string;
  sellerName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;

  addToCart: (product: Product, offer?: CartOffer) => void;

  removeFromCart: (
    productId: number | string,
    offerId?: string
  ) => void;

  updateQuantity: (
    productId: number | string,
    quantity: number,
    offerId?: string
  ) => void;

  clearCart: () => void;

  favoriteProducts: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number | string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {

  // Load cart from localStorage.
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Load favourites from localStorage.
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("favoriteProducts");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart whenever it changes.
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save favourites whenever they change.
  useEffect(() => {
    localStorage.setItem(
      "favoriteProducts",
      JSON.stringify(favoriteProducts)
    );
  }, [favoriteProducts]);

  // Add a product or seller offer to cart.
  const addToCart = (product: Product, offer?: CartOffer) => {
    setCartItems((currentItems) => {

      const existingItem = currentItems.find((item) => {
        const sameProduct =
          String(item.product.id) === String(product.id);

        const sameOffer =
          (item.offerId || "") === (offer?.offerId || "");

        return sameProduct && sameOffer;
      });

      if (existingItem) {
        return currentItems.map((item) => {
          const sameProduct =
            String(item.product.id) === String(product.id);

          const sameOffer =
            (item.offerId || "") === (offer?.offerId || "");

          if (sameProduct && sameOffer) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }

          return item;
        });
      }

      return [
        ...currentItems,
        {
          product,
          quantity: 1,
          offerId: offer?.offerId,
          sellerId: offer?.sellerId,
          sellerName: offer?.sellerName,
        },
      ];
    });
  };

  // Remove one specific cart item.
  const removeFromCart = (
    productId: number | string,
    offerId?: string
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => {
        const sameProduct =
          String(item.product.id) === String(productId);

        const sameOffer =
          (item.offerId || "") === (offerId || "");

        return !(sameProduct && sameOffer);
      })
    );
  };

  // Update one specific cart item's quantity.
  const updateQuantity = (
    productId: number | string,
    quantity: number,
    offerId?: string
  ) => {
    if (quantity < 1) {
      removeFromCart(productId, offerId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        const sameProduct =
          String(item.product.id) === String(productId);

        const sameOffer =
          (item.offerId || "") === (offerId || "");

        if (sameProduct && sameOffer) {
          return {
            ...item,
            quantity,
          };
        }

        return item;
      })
    );
  };

  // Clear cart.
  const clearCart = () => {
    setCartItems([]);
  };

  // Add or remove favourites.
  const toggleFavorite = (product: Product) => {
    setFavoriteProducts((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (item) => String(item.id) === String(product.id)
      );

      return alreadyFavorite
        ? currentFavorites.filter(
            (item) => String(item.id) !== String(product.id)
          )
        : [...currentFavorites, product];
    });
  };

  // Check favourite status.
  const isFavorite = (productId: number | string) => {
    return favoriteProducts.some(
      (item) => String(item.id) === String(productId)
    );
  };

  // Calculate total quantity of cart items.
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate total cart price.
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favoriteProducts,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
