
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  Lock,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../App.css";

function Checkout() {
  const { cartItems, cartCount, cartTotal } = useCart();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  // CHECK LOGIN STATUS USING THE PHP SESSION
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/me.php", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.user) {
          localStorage.removeItem("user");

          if (isMounted) {
            setIsAuthenticated(false);
          }

          return;
        }

        const user = result.user;

        // Keep a display copy in localStorage, but never use it
        // as proof that the PHP session is authenticated.
        localStorage.setItem("user", JSON.stringify(user));

        if (isMounted) {
          setIsAuthenticated(true);
          setCustomer((currentCustomer) => ({
            ...currentCustomer,
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Could not verify the login session:", error);
        localStorage.removeItem("user");

        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // REDIRECT VISITORS TO LOGIN
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/checkout");

      navigate("/login", {
        replace: true,
        state: { from: "/checkout" },
      });
    }
  }, [authChecked, isAuthenticated, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [e.target.name]: e.target.value,
    }));
  };

  // SAVE ORDER THROUGH PHP BACKEND
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/checkout");

      navigate("/login", {
        state: { from: "/checkout" },
      });

      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send only product IDs, quantities and offer IDs.
      // The PHP backend retrieves the actual prices from Supabase.
      const requestBody = {
        customer,
        paymentMethod,
        items: cartItems.map((item) => ({
          product: {
            id: item.product.id,
          },
          quantity: item.quantity,
          offerId: item.offerId || null,
        })),
      };

      const response = await fetch(
        "http://localhost:8000/api/create-order.php",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          localStorage.removeItem("user");
          setIsAuthenticated(false);

          sessionStorage.setItem("redirectAfterLogin", "/checkout");

          navigate("/login", {
            replace: true,
            state: { from: "/checkout" },
          });

          return;
        }

        throw new Error(
          result.message || "Unable to place your order."
        );
      }

      const savedOrder = result.order;

      // Convert the backend response into the format
      // expected by OrderConfirmation.tsx.
      const order = {
        orderNumber: savedOrder.orderNumber,
        orderDate: new Date().toISOString(),
        customer: savedOrder.customer,
        user: JSON.parse(localStorage.getItem("user") || "null"),
        paymentMethod: savedOrder.paymentMethod,
        items: savedOrder.items.map((savedItem: any, index: number) => {
          const cartItem = cartItems[index];

          return {
            product: {
              ...cartItem.product,
              id: savedItem.productId,
              name: savedItem.productName,
              price: Number(savedItem.unitPrice),
            },
            quantity: Number(savedItem.quantity),
            offerId: savedItem.offerId,
            sellerId: savedItem.sellerId,
            sellerName: savedItem.sellerName,
          };
        }),
        itemCount: savedOrder.items.reduce(
          (total: number, item: any) => total + Number(item.quantity),
          0
        ),
        total: Number(savedOrder.total),
        status: savedOrder.status,
      };

      // Keep local copies for the existing order confirmation
      // page and order history functionality.
      const savedOrders = localStorage.getItem("orders");

      let existingOrders: any[] = [];

      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);

          if (Array.isArray(parsedOrders)) {
            existingOrders = parsedOrders;
          }
        } catch {
          existingOrders = [];
        }
      }

      localStorage.setItem(
        "orders",
        JSON.stringify([order, ...existingOrders])
      );

      localStorage.setItem(
        "latestOrder",
        JSON.stringify(order)
      );

      // Continue to order confirmation.
      navigate("/order-confirmation");

    } catch (error) {
      console.error("Could not save the order:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // WAIT UNTIL LOGIN STATUS IS CHECKED
  if (!authChecked) {
    return null;
  }

  // VISITOR MUST LOGIN FIRST
  if (!isAuthenticated) {
    return null;
  }

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <main className="main-container checkout-page">
        <div className="empty-cart">
          <ShoppingCart size={55} />

          <h2>Your cart is empty</h2>

          <p>Add some games before proceeding to checkout.</p>

          <Link to="/store" className="add-button">
            Explore games
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-container checkout-page">

      <div className="checkout-heading">
        <span className="section-label">SECURE CHECKOUT</span>

        <h1>Complete your order</h1>

        <p>Enter your details and review your purchase.</p>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit}>

        <div className="checkout-form">

          {/* CUSTOMER INFORMATION */}
          <section className="checkout-card">

            <h2>01. Customer information</h2>

            <div className="checkout-input-grid">

              <div className="checkout-field">
                <label htmlFor="firstName">First name</label>

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={customer.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="lastName">Last name</label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={customer.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={customer.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">Phone number</label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={customer.phone}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </section>

          {/* BILLING ADDRESS */}
          <section className="checkout-card">

            <h2>02. Billing address</h2>

            <div className="checkout-input-grid">

              <div className="checkout-field full-width">
                <label htmlFor="address">Street address</label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Street and house number"
                  value={customer.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">City</label>

                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={customer.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="postalCode">Postal code</label>

                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  placeholder="Enter postal code"
                  value={customer.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field full-width">
                <label htmlFor="country">Country</label>

                <input
                  id="country"
                  type="text"
                  name="country"
                  placeholder="Enter country"
                  value={customer.country}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </section>

          {/* PAYMENT METHOD */}
          <section className="checkout-card">

            <h2>03. Payment method</h2>

            <label className="payment-option">

              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              <CreditCard size={22} />

              <span>Credit or debit card</span>

            </label>

            <label className="payment-option">

              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              <span className="paypal-text">PayPal</span>

              <span>Pay using your PayPal account</span>

            </label>

            <p className="payment-note">
              Payment integration will be added later. This demo does
              not collect card details or process payments.
            </p>

          </section>

        </div>

        {/* ORDER SUMMARY */}
        <aside className="checkout-summary">

          <h2>Order summary</h2>

          <div className="checkout-products">

            {cartItems.map((item) => (

              <div
                className="checkout-product"
                key={`${item.product.id}-${item.offerId || "standard"}`}
              >

                <img
                  src={item.product.image}
                  alt={item.product.name}
                />

                <div>
                  <h3>{item.product.name}</h3>

                  {item.sellerName ? (
                    <p>Seller: {item.sellerName}</p>
                  ) : (
                    <p>Standard product</p>
                  )}

                  <p>Quantity: {item.quantity}</p>

                  <strong>
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </strong>
                </div>

              </div>

            ))}

          </div>

          <div className="checkout-summary-row">
            <span>Items</span>
            <strong>{cartCount}</strong>
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <strong>€{cartTotal.toFixed(2)}</strong>
          </div>

          <div className="checkout-summary-row">
            <span>Delivery</span>
            <strong className="free-delivery">FREE</strong>
          </div>

          <div className="checkout-total">
            <span>Total</span>
            <strong>€{cartTotal.toFixed(2)}</strong>
          </div>

          <button
            type="submit"
            className="checkout-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing order..." : "Place demo order"}
          </button>

          <div className="checkout-security">
            <Lock size={16} />
            Secure checkout experience
          </div>

          <Link to="/cart" className="checkout-back">
            <ArrowLeft size={16} />
            Back to cart
          </Link>

        </aside>

      </form>

    </main>
  );
}

export default Checkout;
