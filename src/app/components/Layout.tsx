import { NavLink, useLocation, useNavigate, Outlet } from "react-router";
import emergeLogo from "@/imports/emerge-logo.png";
import { isAuthenticated, logout } from "../auth";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const onAdminPage = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";
  const FORM_PAGES = ["/", "/accounting-officer", "/administration-officer", "/administration-logistics-assistant", "/human-resource-coordinator", "/ict-support-officer-gift-chimwendo", "/ict-support-officer-charles-mulero", "/meal-coordinator", "/meal-officer", "/tlcm-team-leader-communications-marketing", "/tl-ldet-team-leader-leadership-development", "/tl-to-team-leader-technical-operations", "/ipa-investment-portfolio-analyst", "/tl-sel-team-leader-sustainable-entrepreneurship", "/plo-procurement-logistics-officer"];
  const isBareHeaderPage = FORM_PAGES.includes(location.pathname) || location.pathname === "/admin/login";

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f5", fontFamily: "Verdana, Geneva, sans-serif" }}>
      <nav style={{
        background: "#fff",
        borderBottom: "3px solid #4C808A",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        boxShadow: "0 2px 8px rgba(76,128,138,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {!isBareHeaderPage && (
          <img src={emergeLogo} alt="Emerge Livelihoods" style={{ height: 48, objectFit: "contain", padding: "8px 0" }} />
        )}

        {!isBareHeaderPage && !onAdminPage && (
          <div style={{ display: "flex", gap: 4, marginLeft: "auto", alignItems: "center" }}>
            <NavLink to="/" end style={({ isActive }) => navLinkStyle(isActive)}>
              Appraisal Form
            </NavLink>

            {authed ? (
              <NavLink to="/admin" style={({ isActive }) => navLinkStyle(isActive || onAdminPage)}>
                Admin
              </NavLink>
            ) : (
              <NavLink to="/admin/login" style={({ isActive }) => navLinkStyle(isActive)}>
                Admin
              </NavLink>
            )}
          </div>
        )}

        {onAdminPage && (
          <div style={{ display: "flex", gap: 4, marginLeft: "auto", alignItems: "center" }}>
            <NavLink to="/admin" style={({ isActive }) => navLinkStyle(isActive || onAdminPage)}>
              Admin Dashboard
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                marginLeft: 12,
                padding: "7px 16px",
                background: "#fff",
                border: "1.5px solid #4C808A",
                borderRadius: 5,
                color: "#4C808A",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: 12,
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#4C808A"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#4C808A"; }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      <Outlet />
    </div>
  );
}

function navLinkStyle(isActive: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "14px 20px",
    fontFamily: "Verdana, Geneva, sans-serif",
    fontSize: 13,
    fontWeight: "bold",
    color: isActive ? "#4C808A" : "#555",
    textDecoration: "none",
    borderBottom: isActive ? "3px solid #4C808A" : "3px solid transparent",
    marginBottom: -3,
    transition: "color 0.15s",
  };
}
