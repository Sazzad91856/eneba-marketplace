
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  ArrowRight,
  Mail,
  MapPin,
  Receipt,
  KeyRound,
  Copy,
  Store,
} from "lucide-react";

import "../App.css";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

interface OrderItem {
  product: {
    id: string | number;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  offerId?: string;
  sellerId?: string;
  sellerName?: string;
}

interface Order {
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
}

function getSavedOrder(): Order | null {
  try {
    const savedOrder = localStorage.getItem("latestOrder");

    if (!savedOrder) return null;

    const parsedOrder: Order = JSON.parse(savedOrder);

    if (
      !parsedOrder.orderNumber ||
      !parsedOrder.customer ||
      !Array.isArray(parsedOrder.items) ||
      typeof parsedOrder.total !== "number"
    ) {
      return null;
    }

    return parsedOrder;
  } catch {
    return null;
  }
}

// Creates a stable demonstration key for each order item.
function generateDemoKey(
  orderNumber: string,
  item: OrderItem,
  index: number
): string {
  const value = `${orderNumber}-${item.product.id}-${item.offerId || "standard"}-${index}`;

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  const part1 = hash.toString(16).toUpperCase().padStart(8, "0");
  const part2 = (hash ^ 0xABCDEF12)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");

  return `DEMO-${part1}-${part2}`;
}

function OrderConfirmation() {
  const order = getSavedOrder();

  if (!order) {
    return (
      <main className="main-container order-confirmation">
        <div className="confirmation-card no-order-card">
          <Package size={60} />
          <h1>No order found</h1>
          <p>You have not placed an order yet.</p>

          <Link to="/store" className="confirmation-button">
            <ShoppingBag size={18} />
            Explore games
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      alert("Demo key copied successfully!");
    } catch {
      alert("Unable to copy the key. Please copy it manually.");
    }
  };

  return (
    <main className="main-container order-confirmation">
      <div className="confirmation-card">

        {/* SUCCESS HEADER */}
        <div className="confirmation-header">
          <CheckCircle
            className="confirmation-icon"
            size={70}
          />

          <span className="section-label">
            ORDER CONFIRMED
          </span>

          <h1>Thank you for your purchase!</h1>

          <p>
            Your demo order has been submitted successfully.
            Your purchase details and digital keys are shown below.
          </p>
        </div>

        {/* ORDER NUMBER */}
        <div className="order-number">
          <div>
            <Receipt size={21} />
            <span>Order number</span>
          </div>

          <strong>{order.orderNumber}</strong>
        </div>

        {/* CUSTOMER INFORMATION */}
        <section className="confirmation-section">
          <h2>Customer information</h2>

          <div className="confirmation-customer">
            <div>
              <strong>Full name</strong>
              <p>
                {order.customer.firstName}{" "}
                {order.customer.lastName}
              </p>
            </div>

            <div>
              <Mail size={17} />
              <div>
                <strong>Email address</strong>
                <p>{order.customer.email}</p>
              </div>
            </div>

            <div>
              <MapPin size={17} />
              <div>
                <strong>Billing address</strong>
                <p>
                  {order.customer.address},{" "}
                  {order.customer.city},{" "}
                  {order.customer.country}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PURCHASED PRODUCTS */}
        <section className="confirmation-section">
          <h2>Purchased games</h2>

          <div className="confirmation-products">
            {order.items.map((item, index) => {
              const demoKey = generateDemoKey(
                order.orderNumber,
                item,
                index
              );

              return (
                <div
                  className="confirmation-product"
                  key={`${item.product.id}-${item.offerId || "standard"}-${index}`}
                  style={{
                    flexWrap: "wrap",
                    rowGap: "16px",
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                  />

                  <div className="confirmation-product-info">
                    <h3>{item.product.name}</h3>

                    <p>Quantity: {item.quantity}</p>

                    <span>
                      €{item.product.price.toFixed(2)} each
                    </span>

                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "8px",
                      }}
                    >
                      <Store size={15} />
                      Seller: {item.sellerName || "Standard seller"}
                    </p>
                  </div>

                  <strong>
                    €{(
                      item.product.price * item.quantity
                    ).toFixed(2)}
                  </strong>

                  {/* DIGITAL KEY */}
                  <div
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "10px",
                      background: "rgba(46, 204, 113, 0.08)",
                      border: "1px solid rgba(46, 204, 113, 0.25)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <KeyRound size={19} />
                      <strong>Digital game key</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <code
                        style={{
                          fontSize: "13px",
                          wordBreak: "break-all",
                        }}
                      >
                        {demoKey}
                      </code>

                      <button
                        type="button"
                        onClick={() => copyKey(demoKey)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <Copy size={15} />
                        Copy key
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: "12px",
                        marginTop: "10px",
                        opacity: 0.75,
                      }}
                    >
                      This is a simulated key for demonstration purposes.
                      It cannot be redeemed on a gaming platform.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ORDER TOTAL */}
        <div className="confirmation-total">
          <span>Order total</span>
          <strong>€{order.total.toFixed(2)}</strong>
        </div>

        {/* DEMO NOTICE */}
        <div className="demo-payment-note">
          <CheckCircle size={18} />
          <p>
            This is a demonstration order. No real payment was processed
            and no genuine game activation keys were issued.
          </p>
        </div>

        {/* CONTINUE SHOPPING */}
        <Link
          to="/store"
          className="confirmation-button"
        >
          <ShoppingBag size={18} />
          Continue shopping
          <ArrowRight size={18} />
        </Link>

      </div>
    </main>
  );
}

export default OrderConfirmation;
