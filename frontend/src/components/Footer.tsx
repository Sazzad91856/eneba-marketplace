
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-main">
          <div>
            <Link to="/" className="logo">
              eneba<span>.</span>
            </Link>

            <p>
              Your gaming marketplace.
              Discover more, play more.
            </p>
          </div>

          <div className="footer-links">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/store">Games</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>

          <div className="footer-links">
            <h3>Customer Area</h3>
            <Link to="/checkout">Checkout</Link>
            <Link to="/store">Browse Products</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Marketplace Demo. All rights reserved.
          </span>

          <span>
            Made for gamers.
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
