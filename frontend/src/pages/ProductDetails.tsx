
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import {
  ShoppingCart,
  Heart,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Truck,
  CheckCircle,
  Store,
  Star,
} from "lucide-react";

import {
  mapSupabaseProduct,
  type Product,
  type SupabaseProductRow,
} from "../data/products";

import { useCart } from "../context/CartContext";

import "../App.css";

// Live PHP API addresses on Render
const API_URL =
  "https://eneba-marketplace-kb59.onrender.com/api/product.php";

const OFFERS_API_URL =
  "https://eneba-marketplace-kb59.onrender.com/api/offers.php";

interface ProductApiResponse {
  success: boolean;
  product?: SupabaseProductRow;
  message?: string;
}

interface SellerOffer {
  id: string;
  product_id: string;
  price: number | string;
  stock: number;
  delivery_type: string;
  seller_id: string;
  seller_name: string;
  seller_rating: number | string;
}

interface OffersApiResponse {
  success: boolean;
  count: number;
  offers: SellerOffer[];
  message?: string;
}

function ProductDetails() {
  const { id } = useParams();

  const {
    addToCart,
    toggleFavorite,
    isFavorite,
  } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<SellerOffer[]>([]);

  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);

  const [error, setError] = useState("");
  const [offersError, setOffersError] = useState("");

  const [addedToCart, setAddedToCart] = useState(false);
  const [addedOfferId, setAddedOfferId] = useState("");

  // Load the selected product.
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setAddedToCart(false);

        const response = await fetch(
          `${API_URL}?id=${encodeURIComponent(id)}`
        );

        const result: ProductApiResponse = await response.json();

        if (!response.ok || !result.success || !result.product) {
          throw new Error(
            result.message || "Unable to load product."
          );
        }

        if (!isMounted) return;

        setProduct(mapSupabaseProduct(result.product));

      } catch (err) {
        if (!isMounted) return;

        console.error("Product API error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the product."
        );

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load seller offers for this product.
  useEffect(() => {
    let isMounted = true;

    async function fetchOffers() {
      if (!id) {
        setOffersLoading(false);
        return;
      }

      try {
        setOffersLoading(true);
        setOffersError("");
        setOffers([]);

        const response = await fetch(
          `${OFFERS_API_URL}?product_id=${encodeURIComponent(id)}`
        );

        const result: OffersApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load seller offers."
          );
        }

        if (!isMounted) return;

        const sortedOffers = (result.offers || []).sort(
          (a, b) => Number(a.price) - Number(b.price)
        );

        setOffers(sortedOffers);

      } catch (err) {
        if (!isMounted) return;

        console.error("Seller offers API error:", err);

        setOffersError(
          err instanceof Error
            ? err.message
            : "Unable to load seller offers."
        );

      } finally {
        if (isMounted) {
          setOffersLoading(false);
        }
      }
    }

    fetchOffers();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Add the main product price to cart.
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);
    setAddedToCart(true);
  };

  // Add a seller's selected offer to cart.
  const handleAddOfferToCart = (offer: SellerOffer) => {
    if (!product) return;

    const offerProduct: Product = {
      ...product,
      price: Number(offer.price),
    };

    addToCart(offerProduct, {
      offerId: offer.id,
      sellerId: offer.seller_id,
      sellerName: offer.seller_name,
    });

    setAddedOfferId(offer.id);
  };

  // Loading state.
  if (loading) {
    return (
      <main className="main-container product-details">
        <div className="not-found">
          <h2>Loading product...</h2>
        </div>
      </main>
    );
  }

  // Error state.
  if (error) {
    return (
      <main className="main-container product-details">
        <div className="not-found">
          <h2>Unable to load product</h2>
          <p>{error}</p>

          <Link to="/store" className="back-link">
            <ArrowLeft size={18} />
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  // Product not found.
  if (!product) {
    return (
      <main className="main-container product-details">
        <div className="not-found">
          <h2>Product not found</h2>

          <Link to="/store" className="back-link">
            <ArrowLeft size={18} />
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  const favourite = isFavorite(product.id);
  const hasDiscount = product.oldPrice > product.price;

  // Add or remove favourite.
  const handleFavourite = () => {
    toggleFavorite(product);
  };

  return (
    <main className="main-container product-details">

      <Link to="/store" className="back-link">
        <ArrowLeft size={18} />
        Back to store
      </Link>

      <div className="details-layout">

        {/* PRODUCT IMAGE */}
        <div className="details-image">
          <img src={product.image} alt={product.name} />

          {hasDiscount && product.discount && (
            <span className="details-discount">
              {product.discount}
            </span>
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="details-info">

          <div className="details-category">
            <span>{product.platform}</span>
            <span>{product.category}</span>
          </div>

          <h1>{product.name}</h1>

          <p className="details-description">
            {product.description}
          </p>

          <div className="details-stock">
            <CheckCircle size={17} />
            Available for purchase
          </div>

          {/* MAIN PRODUCT PRICE */}
          <div className="details-price">

            {hasDiscount && (
              <span className="old-price">
                €{product.oldPrice.toFixed(2)}
              </span>
            )}

            <span className="price">
              €{product.price.toFixed(2)}
            </span>

            {hasDiscount && product.discount && (
              <span className="details-discount-text">
                {product.discount} OFF
              </span>
            )}

          </div>

          <p className="details-delivery">
            <Zap size={17} />
            Instant digital delivery
          </p>

          {/* ADD TO CART */}
          <button
            className="add-button details-cart-button"
            type="button"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={19} />

            {addedToCart
              ? "Add another to cart"
              : "Add to cart"}
          </button>

          {/* FAVOURITES */}
          <button
            className={`details-favorite ${
              favourite ? "is-favourite" : ""
            }`}
            type="button"
            onClick={handleFavourite}
          >
            <Heart
              size={19}
              fill={favourite ? "currentColor" : "none"}
            />

            {favourite
              ? "Remove from favourites"
              : "Add to favourites"}
          </button>

        </div>
      </div>

      {/* SELLER OFFERS */}
      <section className="product-section seller-offers-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              COMPARE SELLERS
            </span>

            <h2>Available offers</h2>

            <p>
              Compare prices from different sellers.
            </p>
          </div>
        </div>

        {offersLoading ? (
          <p>Loading seller offers...</p>
        ) : offersError ? (
          <p>{offersError}</p>
        ) : offers.length === 0 ? (
          <p>No seller offers are currently available.</p>
        ) : (
          <div className="seller-offers-list">

            {offers.map((offer, index) => (
              <div className="seller-offer-card" key={offer.id}>

                <div className="seller-offer-info">

                  <div className="seller-offer-icon">
                    <Store size={23} />
                  </div>

                  <div>
                    <h3>{offer.seller_name}</h3>

                    <p className="seller-rating">
                      <Star
                        size={15}
                        fill="currentColor"
                      />
                      {Number(offer.seller_rating).toFixed(1)} / 5
                    </p>

                    <small>
                      {offer.delivery_type}
                    </small>
                  </div>

                </div>

                <div className="seller-offer-purchase">

                  <div className="seller-offer-price">
                    €{Number(offer.price).toFixed(2)}
                  </div>

                  <span className="seller-stock">
                    {offer.stock} available
                  </span>

                  {index === 0 && (
                    <span className="seller-best-price">
                      Best price
                    </span>
                  )}

                  <button
                    type="button"
                    className="add-button seller-add-button"
                    onClick={() => handleAddOfferToCart(offer)}
                  >
                    <ShoppingCart size={17} />

                    {addedOfferId === offer.id
                      ? "Added"
                      : "Add to cart"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* BENEFITS */}
      <div className="details-benefits">

        <div>
          <ShieldCheck size={21} />
          <span>
            <strong>Secure shopping</strong>
            <small>Safe and secure payment</small>
          </span>
        </div>

        <div>
          <Truck size={21} />
          <span>
            <strong>Instant delivery</strong>
            <small>Digital product delivery</small>
          </span>
        </div>

        <div>
          <CheckCircle size={21} />
          <span>
            <strong>Quality guaranteed</strong>
            <small>Shop with confidence</small>
          </span>
        </div>

      </div>

    </main>
  );
}

export default ProductDetails;
