import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Artists from "../pages/Artists";
import ArtistDetail from "../pages/ArtistDetail";
import Verification from "../pages/Verification";
import Customers from "../pages/Customers";
import CustomerDetail from "../pages/CustomerDetail";
import Bookings from "../pages/Bookings";
import BookingDetail from "../pages/BookingDetail";
import DuePayments from "../pages/DuePayments";
import Settings from "../pages/Settings";

export default function AdminRoutes() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <Routes>
      <Route
        path="login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="artists" element={<Artists />} />
        <Route path="artists/:id" element={<ArtistDetail />} />
        <Route path="verification" element={<Verification />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="due-payments" element={<DuePayments />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
