
import { useEffect, useState } from "react";

import {
  ChevronRight,
  Gamepad2,
  ShieldCheck,
  Zap,
  Headphones,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  type Product,
  type SupabaseProductRow,
  mapSupabaseProduct,
} from "../data/products";

import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../App.css";

// Live PHP API addresses on Render
const API_URL =
  "https://eneba-marketplace-kb59.onrender.com/api/homepage.php";

const BANNER_API_URL =
  "https://eneba-marketplace-kb59.onrender.com/api/banner.php";

interface HomepageApiResponse {
  success: boolean;
  best_sellers?: SupabaseProductRow[];
  special_offers?: SupabaseProductRow[];
  message?: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
}

interface BannerApiResponse {
  success: boolean;
  banner: Banner | null;
  message?: string;
}

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);

  const [banner, setBanner] = useState<Banner | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    // FETCH BEST SELLERS AND SPECIAL OFFERS
    const fetchHomepageProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to connect to homepage API");
        }

        const result: HomepageApiResponse = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load homepage products"
          );
        }

        if (!isMounted) return;

        setFeaturedProducts(
          (result.best_sellers || []).map(mapSupabaseProduct)
        );

        setOfferProducts(
          (result.special_offers || []).map(mapSupabaseProduct)
        );
      } catch (err) {
        if (!isMounted) return;

        console.error("Homepage products error:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // FETCH PROMOTIONAL BANNER
    const fetchBanner = async () => {
      try {
        setBannerLoading(true);
        setBannerError("");

        const response = await fetch(BANNER_API_URL);

        if (!response.ok) {
          throw new Error("Failed to connect to banner API");
        }

        const result: BannerApiResponse = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load homepage banner"
          );
        }

        if (!isMounted) return;

        setBanner(result.banner);
      } catch (err) {
        if (!isMounted) return;

        console.error("Homepage banner error:", err);
        setBannerError("Unable to load promotional banner.");
      } finally {
        if (isMounted) {
          setBannerLoading(false);
        }
      }
    };

    fetchHomepageProducts();
    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="app">
      {/* REUSABLE HEADER */}
      <Header />

      <main className="main-container">
        {/* DYNAMIC HERO BANNER */}
        <section className="hero">
          <div className="hero-content">

            {/* PERSONALIZED GAMING BRANDING */}
            <span className="hero-label">
              WELCOME TO SAZZAD'S GAMING WORLD
            </span>

            {bannerLoading ? (
              <h1>Loading banner...</h1>
            ) : bannerError ? (
              <h1>{bannerError}</h1>
            ) : banner ? (
              <>
                {/* EXISTING DYNAMIC BANNER TITLE */}
                <h1>{banner.title}</h1>

                <p>{banner.subtitle}</p>

                <Link
                  to={banner.button_link}
                  className="hero-button"
                >
                  {banner.button_text}
                  <ChevronRight size={19} />
                </Link>
              </>
            ) : (
              <h1>No promotional banner available.</h1>
            )}
          </div>

          <div className="hero-decoration">
            <Gamepad2 size={150} strokeWidth={1} />
          </div>
        </section>

        {/* BENEFITS */}
        <section className="benefits">
          <div>
            <ShieldCheck />
            <span>Secure shopping</span>
          </div>

          <div>
            <Zap />
            <span>Instant delivery</span>
          </div>

          <div>
            <Headphones />
            <span>Customer support</span>
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className="product-section" id="store">
          <div className="section-heading">
            <div>
              <span className="section-label">
                DISCOVER MORE
              </span>

              <h2>Best sellers</h2>
            </div>

            <Link to="/store">
              View all
              <ChevronRight size={17} />
            </Link>
          </div>

          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p>{error}</p>
          ) : featuredProducts.length === 0 ? (
            <p>No products available right now.</p>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>

        {/* SPECIAL OFFERS */}
        <section className="product-section" id="deals">
          <div className="section-heading">
            <div>
              <span className="section-label">
                DON'T MISS OUT
              </span>

              <h2>Deals you'll love</h2>
            </div>

            <Link to="/store">
              View all
              <ChevronRight size={17} />
            </Link>
          </div>

          {loading ? (
            <p>Loading special offers...</p>
          ) : error ? (
            <p>{error}</p>
          ) : offerProducts.length === 0 ? (
            <p>No special offers available right now.</p>
          ) : (
            <div className="product-grid">
              {offerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* REUSABLE FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;
