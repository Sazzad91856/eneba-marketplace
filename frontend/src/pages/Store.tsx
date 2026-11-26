
import API_BASE_URL from "../lib/api";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import {
  mapSupabaseProduct,
  type Product,
  type SupabaseProductRow,
} from "../data/products";

import ProductCard from "../components/ProductCard";
import "../App.css";

// Shared PHP API address
const API_URL = `${API_BASE_URL}/products.php`;

// Compare two words and return their Levenshtein edit distance.
// This allows small spelling mistakes, such as "cyberpnk".
function getEditDistance(first: string, second: string): number {
  const previousRow = Array.from(
    { length: second.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= first.length; i++) {
    let diagonal = previousRow[0];
    previousRow[0] = i;

    for (let j = 1; j <= second.length; j++) {
      const previousValue = previousRow[j];

      previousRow[j] = Math.min(
        previousRow[j] + 1,
        previousRow[j - 1] + 1,
        diagonal + (first[i - 1] === second[j - 1] ? 0 : 1)
      );

      diagonal = previousValue;
    }
  }

  return previousRow[second.length];
}

// Check whether a search word matches a product word.
function wordMatches(searchWord: string, productWord: string): boolean {
  if (productWord.includes(searchWord) || searchWord.includes(productWord)) {
    return true;
  }

  // Avoid fuzzy matching very short words because it creates false results.
  if (searchWord.length < 4 || productWord.length < 4) {
    return false;
  }

  const allowedDistance = searchWord.length >= 8 ? 2 : 1;

  return getEditDistance(searchWord, productWord) <= allowedDistance;
}

// Match a search against the product name, platform, or category.
function matchesProductSearch(product: Product, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const searchableText = [
    product.name,
    product.platform,
    product.category,
  ]
    .join(" ")
    .toLowerCase();

  // Handle common abbreviations.
  const aliases: Record<string, string[]> = {
    gta: ["grand theft auto"],
  };

  if (aliases[searchTerm]) {
    return aliases[searchTerm].some((alias) =>
      searchableText.includes(alias)
    );
  }

  // A complete phrase or partial phrase match is the fastest and most accurate.
  if (searchableText.includes(searchTerm)) {
    return true;
  }

  const searchWords = searchTerm.split(/\s+/).filter(Boolean);
  const productWords = searchableText.split(/[^a-z0-9]+/).filter(Boolean);

  // Every search word must match at least one word in the product information.
  return searchWords.every((searchWord) =>
    productWords.some((productWord) =>
      wordMatches(searchWord, productWord)
    )
  );
}

interface ProductsApiResponse {
  success: boolean;
  count: number;
  products: SupabaseProductRow[];
  message?: string;
}

function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [platform, setPlatform] = useState("All");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Load products through the PHP REST API.
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to connect to the PHP API.");
        }

        const result: ProductsApiResponse = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load products."
          );
        }

        if (!isMounted) return;

        const databaseProducts = result.products.map((row) =>
          mapSupabaseProduct(row)
        );

        setProducts(databaseProducts);
      } catch (err) {
        if (!isMounted) return;

        console.error("PHP API error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products."
        );

        setProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep the search field synchronized with the URL.
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);
  }, [searchParams]);

  // Update the URL when the user searches inside the Store page.
  const handleSearchChange = (value: string) => {
    setSearch(value);

    const newParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }

    setSearchParams(newParams, { replace: true });
  };

  // Get available platforms and categories.
  const platforms = useMemo(
    () =>
      [...new Set(products.map((product) => product.platform))].sort(),
    [products]
  );

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category))].sort(),
    [products]
  );

  // Filter and sort products.
  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const minimum = minPrice === "" ? null : Number(minPrice);
    const maximum = maxPrice === "" ? null : Number(maxPrice);

    return products
      .filter((product) => {
        const matchesSearch = matchesProductSearch(product, searchTerm);

        const matchesPlatform =
          platform === "All" || product.platform === platform;

        const matchesCategory =
          category === "All" || product.category === category;

        const matchesMinPrice =
          minimum === null || product.price >= minimum;

        const matchesMaxPrice =
          maximum === null || product.price <= maximum;

        return (
          matchesSearch &&
          matchesPlatform &&
          matchesCategory &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      })
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        return 0;
      });
  }, [products, search, platform, category, sort, minPrice, maxPrice]);

  // Reset all filters.
  const clearFilters = () => {
    setSearch("");
    setPlatform("All");
    setCategory("All");
    setSort("default");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    search !== "" ||
    platform !== "All" ||
    category !== "All" ||
    sort !== "default" ||
    minPrice !== "" ||
    maxPrice !== "";

  return (
    <div className="app">
      <main className="main-container">
        <section className="product-section store-page">
          <div className="section-heading">
            <div>
              <span className="section-label">
                GAMING MARKETPLACE
              </span>

              <h2>Explore games &amp; gift cards</h2>
              <p>Discover games and digital gift cards across your favourite platforms.</p>
            </div>
          </div>

          <div className="store-toolbar">
            <div className="store-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search games, gift cards, platforms or categories..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="store-sort">
              <SlidersHorizontal size={18} />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                <option value="default">Default sorting</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>

              <ChevronDown size={16} />
            </div>
          </div>

          <div className="store-filter-panel">
            <div className="store-filter-heading">
              <h3>Filter products</h3>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="clear-filters-button"
                  onClick={clearFilters}
                >
                  <RotateCcw size={15} />
                  Clear filters
                </button>
              )}
            </div>

            <div className="store-filters">
              <div>
                <label htmlFor="platform-filter">Platform</label>

                <select
                  id="platform-filter"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="All">All platforms</option>

                  {platforms.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category-filter">Category</label>

                <select
                  id="category-filter"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All">All categories</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="price-filter">
                <label htmlFor="min-price">Minimum price (€)</label>

                <input
                  id="min-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min €"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="price-filter">
                <label htmlFor="max-price">Maximum price (€)</label>

                <input
                  id="max-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max €"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="store-results">
            <h3>
              Available products ({filteredProducts.length})
            </h3>

            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          {loading ? (
            <div className="empty-results">
              <p>Loading products from PHP API...</p>
            </div>
          ) : error ? (
            <div className="empty-results">
              <h3>Unable to load products</h3>
              <p>{error}</p>

              <button
                type="button"
                className="clear-filters-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <ShoppingCart size={40} />

              <h3>No products found</h3>
              <p>Try changing your search or filters.</p>

              <button
                type="button"
                className="clear-filters-button empty-clear-button"
                onClick={clearFilters}
              >
                <RotateCcw size={16} />
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Store;
