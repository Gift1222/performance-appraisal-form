import { Navigate, Outlet } from "react-router";
import { isAuthenticated } from "../auth";

export default function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
