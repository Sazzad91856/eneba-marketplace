
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../App.css";

function Wishlist() {
  const {
    favoriteProducts,
    toggleFavorite,
    addToCart,
  } = useCart();

  return (
    <main className="main-container wishlist-page">
      <div className="wishlist-heading">
        <span className="section-label">YOUR COLLECTION</span>
        <h1>My Wishlist</h1>
        <p>
          Your favourite games, all in one place.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={60} />
          <h2>Your wishlist is empty</h2>
          <p>
            Save your favourite games and find them here later.
          </p>

          <Link to="/store" className="add-button">
            Explore games
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          <div className="wishlist-count">
            <Heart size={18} />
            {favoriteProducts.length} saved games
          </div>

          <div className="wishlist-grid">
            {favoriteProducts.map((product) => (
              <article
                className="product-card wishlist-card"
                key={product.id}
              >
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <button
                    type="button"
                    className="favorite-button active"
                    onClick={() => toggleFavorite(product)}
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                <div className="product-info">
                  <span className="platform">
                    {product.platform}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="price-container">
                    <span className="old-price">
                      €{product.oldPrice.toFixed(2)}
                    </span>

                    <span className="price">
                      €{product.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart size={17} />
                    Add to cart
                  </button>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() => toggleFavorite(product)}
                  >
                    <Trash2 size={16} />
                    Remove from wishlist
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-view-link"
                  >
                    View product
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default Wishlist;
