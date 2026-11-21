
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useCart();

  const favorite = isFavorite(product.id);
  const hasDiscount = product.oldPrice > product.price;

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />

        {hasDiscount && product.discount && (
          <span className="discount">{product.discount}</span>
        )}

        <button
          className={`favorite-button ${favorite ? "active" : ""}`}
          type="button"
          aria-label={
            favorite
              ? `Remove ${product.name} from favourites`
              : `Add ${product.name} to favourites`
          }
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product)}
        >
          <Heart
            size={18}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="product-info">
        <span className="platform">{product.platform}</span>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="price-container">
          {hasDiscount && (
            <span className="old-price">
              €{product.oldPrice.toFixed(2)}
            </span>
          )}

          <span className="price">
            €{product.price.toFixed(2)}
          </span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="add-button"
        >
          <ShoppingCart size={17} />
          View product
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
