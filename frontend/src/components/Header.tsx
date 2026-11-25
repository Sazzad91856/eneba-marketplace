
import { useState, useEffect, type FormEvent } from "react";

import {
  Search,
  ShoppingCart,
  UserRound,
  Heart,
  Gamepad2,
  Receipt,
  LogOut,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE_URL =
  "https://eneba-marketplace-kb59.onrender.com/api";

const SESSION_API_URL = `${API_BASE_URL}/me.php`;
const LOGOUT_API_URL = `${API_BASE_URL}/logout.php`;

interface User {
  id: string;
  name: string;
  email: string;
}

function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // CHECK PHP LOGIN SESSION
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(SESSION_API_URL, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          localStorage.removeItem("user");
          return;
        }

        const result = await response.json();

        if (result.success && result.user) {
          setUser(result.user);

          // Keep local user information for existing frontend features.
          localStorage.setItem(
            "user",
            JSON.stringify(result.user)
          );
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  // SEARCH PRODUCTS
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    navigate(`/store?search=${encodeURIComponent(query)}`);
  };

  // LOG OUT
  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(LOGOUT_API_URL, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Logout failed."
        );
      }

      setUser(null);
      localStorage.removeItem("user");

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Logout error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-container">

          <Link to="/" className="logo">
            eneba<span>.</span>
          </Link>

          <form className="search-box" onSubmit={handleSearch}>
            <Search size={20} />

            <input
              type="text"
              placeholder="Search games, gift cards and more..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

            <button type="submit">Search</button>
          </form>

          <div className="header-actions">

            {/* WISHLIST */}
            <Link
              to="/wishlist"
              className="icon-button"
              aria-label="Wishlist"
            >
              <Heart size={21} />
            </Link>

            {/* MY ORDERS */}
            <Link
              to="/orders"
              className="icon-button"
              aria-label="My Orders"
              title="My Orders"
            >
              <Receipt size={21} />
            </Link>

            {/* SHOPPING CART */}
            <Link
              to="/cart"
              className="icon-button cart-icon"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* AUTHENTICATION */}
            {!authLoading && (
              user ? (
                <>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <UserRound size={18} />
                    {user.name || user.email}
                  </span>

                  <button
                    type="button"
                    className="login-button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="login-button"
                  >
                    <UserRound size={18} />
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="register-button"
                  >
                    Register
                  </Link>
                </>
              )
            )}

          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="navigation">
        <div className="navigation-container">

          <Link to="/store">
            <Gamepad2 size={17} />
            Games
          </Link>

          <Link to="/store">Gift Cards</Link>
          <Link to="/store">PC</Link>
          <Link to="/store">PlayStation</Link>
          <Link to="/store">Xbox</Link>
          <Link to="/store#deals">Special Offers</Link>

        </div>
      </nav>
    </>
  );
}

export default Header;
