
import { Link } from "react-router-dom";

import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Store,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../App.css";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  } = useCart();

  return (
    <div className="app">
      <main className="main-container">

        <section className="cart-page">

          <div className="section-heading">
            <div>
              <span className="section-label">
                YOUR SHOPPING
              </span>

              <h2>Shopping Cart</h2>

              <p>
                Review your selected games before checkout.
              </p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={55} />

              <h3>Your cart is empty</h3>

              <p>
                Looks like you haven't added any games yet.
              </p>

              <Link to="/store" className="add-button">
                Explore games
              </Link>
            </div>
          ) : (

            <div className="cart-layout">

              {/* CART ITEMS */}
              <div className="cart-items">

                {cartItems.map((item) => (

                  <article
                    className="cart-item"
                    key={`${item.product.id}-${item.offerId || "standard"}`}
                  >

                    <img
                      src={item.product.image}
                      alt={item.product.name}
                    />

                    <div className="cart-item-info">

                      <span className="platform">
                        {item.product.platform}
                      </span>

                      <h3>{item.product.name}</h3>

                      {/* SELECTED SELLER */}
                      {item.sellerName ? (
                        <div className="cart-seller">
                          <Store size={15} />
                          <span>
                            Sold by: <strong>{item.sellerName}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="cart-seller">
                          <Store size={15} />
                          <span>Standard product</span>
                        </div>
                      )}

                      <p className="cart-item-price">
                        €{item.product.price.toFixed(2)}
                      </p>

                      {/* QUANTITY CONTROLS */}
                      <div className="quantity-controls">

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.offerId
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.offerId
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                    </div>

                    {/* ITEM ACTIONS */}
                    <div className="cart-item-actions">

                      <strong>
                        €{(
                          item.product.price * item.quantity
                        ).toFixed(2)}
                      </strong>

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() =>
                          removeFromCart(
                            item.product.id,
                            item.offerId
                          )
                        }
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </article>

                ))}

                <Link
                  to="/store"
                  className="continue-shopping"
                >
                  <ArrowLeft size={17} />
                  Continue shopping
                </Link>

              </div>

              {/* ORDER SUMMARY */}
              <aside className="cart-summary">

                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>€{cartTotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="free-delivery">
                    FREE
                  </span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>
                    €{cartTotal.toFixed(2)}
                  </strong>
                </div>

                <Link
                  to="/checkout"
                  className="checkout-button"
                >
                  Proceed to checkout
                </Link>

                <div className="cart-security">
                  <ShieldCheck size={18} />
                  Secure shopping experience
                </div>

              </aside>

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default Cart;
