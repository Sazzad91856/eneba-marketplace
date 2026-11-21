
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Receipt,
  CalendarDays,
  Store,
  RefreshCw,
} from "lucide-react";

import "../App.css";

interface OrderItem {
  productId: string;
  productName: string;
  sellerId: string | null;
  sellerName: string | null;
  offerId: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/my-orders.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/orders" },
        });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your orders."
        );
      }

      setOrders(result.orders || []);
    } catch (err) {
      console.error("Order history error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main
      className="main-container"
      style={{
        paddingTop: "40px",
        paddingBottom: "70px",
        minHeight: "70vh",
      }}
    >
      {/* PAGE HEADING */}
      <div style={{ marginBottom: "30px" }}>
        <span className="section-label">YOUR ACCOUNT</span>

        <h1 style={{ marginTop: "10px" }}>
          My Orders
        </h1>

        <p style={{ opacity: 0.75 }}>
          View your previous purchases and order details.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <RefreshCw
            size={35}
            className="loading-spinner"
          />
          <p>Loading your orders...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            padding: "25px",
            borderRadius: "12px",
            background: "rgba(255, 70, 70, 0.08)",
            border: "1px solid rgba(255, 70, 70, 0.3)",
          }}
        >
          <h2>Unable to load orders</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchOrders}
            className="confirmation-button"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      )}

      {/* EMPTY ORDERS */}
      {!loading && !error && orders.length === 0 && (
        <div
          className="confirmation-card"
          style={{
            textAlign: "center",
            padding: "45px 20px",
          }}
        >
          <Package size={55} />

          <h2>No orders yet</h2>

          <p>
            You haven't purchased any games yet.
            Start exploring our store!
          </p>

          <Link
            to="/store"
            className="confirmation-button"
            style={{ marginTop: "20px" }}
          >
            <ShoppingBag size={18} />
            Explore games
          </Link>
        </div>
      )}

      {/* ORDER LIST */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h2>
              Your purchases ({orders.length})
            </h2>

            <button
              type="button"
              onClick={fetchOrders}
              className="confirmation-button"
            >
              <RefreshCw size={16} />
              Refresh orders
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: "22px",
            }}
          >
            {orders.map((order) => (
              <section
                key={order.id}
                style={{
                  background: "#1e1829",
                  border: "1px solid #3a3049",
                  borderRadius: "14px",
                  padding: "22px",
                }}
              >
                {/* ORDER HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        marginBottom: "9px",
                      }}
                    >
                      <Receipt size={19} />

                      <strong>{order.orderNumber}</strong>
                    </div>

                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        opacity: 0.75,
                        fontSize: "14px",
                      }}
                    >
                      <CalendarDays size={15} />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    style={{
                      background: "rgba(46, 204, 113, 0.12)",
                      color: "#55d995",
                      padding: "7px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <hr
                  style={{
                    border: 0,
                    borderTop: "1px solid #3a3049",
                    marginBottom: "18px",
                  }}
                />

                {/* ORDER ITEMS */}
                <div style={{ display: "grid", gap: "17px" }}>
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.offerId || "standard"}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <h3 style={{ marginBottom: "7px" }}>
                          {item.productName}
                        </h3>

                        <p style={{ fontSize: "14px", opacity: 0.75 }}>
                          Quantity: {item.quantity}
                        </p>

                        <p
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            opacity: 0.8,
                            marginTop: "5px",
                          }}
                        >
                          <Store size={15} />
                          Seller: {item.sellerName || "Standard seller"}
                        </p>

                        <p
                          style={{
                            fontSize: "13px",
                            opacity: 0.7,
                            marginTop: "5px",
                          }}
                        >
                          €{item.unitPrice.toFixed(2)} each
                        </p>
                      </div>

                      <strong>
                        €{item.lineTotal.toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <hr
                  style={{
                    border: 0,
                    borderTop: "1px solid #3a3049",
                    margin: "20px 0",
                  }}
                />

                {/* ORDER FOOTER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>
                      Payment method: {order.paymentMethod}
                    </p>

                    <p style={{ marginTop: "5px" }}>
                      Order total
                    </p>
                  </div>

                  <strong
                    style={{
                      fontSize: "24px",
                      color: "#bd78ff",
                    }}
                  >
                    €{order.total.toFixed(2)}
                  </strong>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default OrderHistory;
