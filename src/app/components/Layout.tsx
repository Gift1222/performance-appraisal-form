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
      <style>{`
        .nav-root {
          background: #fff;
          border-bottom: 3px solid #4C808A;
          padding: 0 32px;
          display: flex;
          align-items: center;
          gap: 32px;
          box-shadow: 0 2px 8px rgba(76,128,138,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          flex-wrap: wrap;
        }
        .nav-logo {
          height: 48px;
          object-fit: contain;
          padding: 8px 0;
        }
        .nav-links {
          display: flex;
          gap: 4px;
          margin-left: auto;
          align-items: center;
          flex-wrap: wrap;
        }
        .nav-logout-btn {
          margin-left: 12px;
          padding: 7px 16px;
          background: #fff;
          border: 1.5px solid #4C808A;
          border-radius: 5px;
          color: #4C808A;
          font-family: Verdana, Geneva, sans-serif;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }
        .nav-logout-btn:hover {
          background: #4C808A;
          color: #fff;
        }
        @media (max-width: 600px) {
          .nav-root {
            padding: 0 12px;
            gap: 8px;
          }
          .nav-logo {
            height: 38px;
          }
          .nav-links {
            margin-left: 0;
            width: 100%;
            padding: 4px 0 8px;
            gap: 2px;
          }
          .nav-logout-btn {
            margin-left: 4px;
            padding: 6px 12px;
            font-size: 11px;
          }
        }
      `}</style>
      <nav className="nav-root">
        {!isBareHeaderPage && (
          <img src={emergeLogo} alt="Emerge Livelihoods" className="nav-logo" />
        )}

        {!isBareHeaderPage && !onAdminPage && (
          <div className="nav-links">
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
          <div className="nav-links">
            <NavLink to="/admin" style={({ isActive }) => navLinkStyle(isActive || onAdminPage)}>
              Admin Dashboard
            </NavLink>

            <button
              onClick={handleLogout}
              className="nav-logout-btn"
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
