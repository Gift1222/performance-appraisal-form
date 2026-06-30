import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { login } from "../auth";
import adminLogo from "@/imports/emerge-logo-1.png";

const TEAL = "#4C808A";
const NAVY = "#16294A";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Admin Login — Emerge Livelihoods";
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = login(username, password);
      if (ok) {
        navigate("/admin");
      } else {
        setError(
          "Invalid username or password. Please try again.",
        );
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Verdana, Geneva, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: `2px solid ${TEAL}`,
          borderRadius: 12,
          padding: "48px 44px 40px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 8px 32px rgba(76,128,138,0.12)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <img
            src={adminLogo}
            alt="Emerge Livelihoods"
            style={{
              maxHeight: 110,
              maxWidth: 280,
              objectFit: "contain",
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            textAlign: "center",
            color: TEAL,
            fontSize: 18,
            fontWeight: "bold",
            margin: "0 0 4px",
          }}
        >
          Admin Portal
        </h1>
        <p
          style={{
            textAlign: "center",
            color: TEAL,
            fontSize: 12,
            margin: "0 0 32px",
          }}
        >
          Sign in to manage performance appraisals
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 20,
              fontSize: 12,
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Username */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: "bold",
                color: TEAL,
                marginBottom: 6,
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              autoComplete="username"
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = TEAL)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#d1d5db")
              }
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: "bold",
                color: TEAL,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = TEAL)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "#d1d5db")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 13,
                  padding: 0,
                  fontFamily: "Verdana, Geneva, sans-serif",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#7eaeb6" : TEAL,
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontFamily: "Verdana, Geneva, sans-serif",
              fontSize: 14,
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
              letterSpacing: "0.3px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* <p style={{ textAlign: "center", fontSize: 11, color: TEAL, marginTop: 24, marginBottom: 0 }}>
          Emerge Livelihoods &mdash; Confidential Admin Access
        </p> */}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 13,
  color: "#222",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};