
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* Homepage */}
            <Route path="/" element={<Home />} />

            {/* Store page */}
            <Route path="/store" element={<Store />} />

            {/* Individual product details */}
            <Route
              path="/product/:id"
              element={<ProductDetails />}
            />

            {/* Shopping cart */}
            <Route path="/cart" element={<Cart />} />

            {/* Wishlist page */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Order history */}
            <Route
              path="/orders"
              element={<OrderHistory />}
            />

            {/* Checkout page */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Order confirmation page */}
            <Route
              path="/order-confirmation"
              element={<OrderConfirmation />}
            />

            {/* Authentication pages */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
