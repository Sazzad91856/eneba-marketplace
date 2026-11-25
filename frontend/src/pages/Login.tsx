
import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Gamepad2, Eye, EyeOff } from "lucide-react";

import "../App.css";

const API_URL =
  "https://eneba-marketplace-kb59.onrender.com/api/login.php";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      // Save authenticated user information.
      localStorage.setItem("user", JSON.stringify(result.user));

      // Restore the originally requested page.
      const routeDestination = location.state?.from;
      const savedDestination = sessionStorage.getItem(
        "redirectAfterLogin"
      );

      const destination =
        typeof routeDestination === "string"
          ? routeDestination
          : savedDestination || "/";

      sessionStorage.removeItem("redirectAfterLogin");

      navigate(destination, { replace: true });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-logo">
          eneba<span>.</span>
        </Link>

        <div className="auth-icon">
          <Gamepad2 size={32} />
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to your account and continue your gaming journey.
        </p>

        <form onSubmit={handleLogin} className="auth-form">

          <label htmlFor="login-email">
            Email address
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">
            Password
          </label>

          <div className="auth-password-field">

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>

          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

        <Link to="/" className="auth-back">
          Back to marketplace
        </Link>

      </div>
    </div>
  );
}

export default Login;
