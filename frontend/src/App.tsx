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
import Login from "./pages/Login";
import Register from "./pages/Register";

import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
