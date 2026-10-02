import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../core/layout/Layout";
import ProtectedRoute from "../core/guards/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import TwoFactorVerify from "../pages/TwoFactorVerify";
import Dashboard from "../pages/Dashboard";
import Security from "../pages/Security";
import Notifications from "../pages/Notifications";
import QRDemo from "../pages/QRDemo";
import Accessibility from "../pages/Accessibility";
import MyActivity from "../pages/MyActivity";
import Users from "../pages/Users";
import AuditLog from "../pages/AuditLog";
import Items from "../modules/demo/Items";
import { NotFound, Forbidden, Deactivated } from "../pages/StatusPages";

// Topic pages get added here on reveal day, e.g.:
// <Route path="/items" element={<ProtectedRoute minRole="staff"><Items /></ProtectedRoute>} />
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/2fa" element={<TwoFactorVerify />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/qr-demo" element={<ProtectedRoute><QRDemo /></ProtectedRoute>} />
        <Route path="/accessibility" element={<ProtectedRoute><Accessibility /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
        <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute minRole="staff"><Users /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute minRole="staff"><AuditLog /></ProtectedRoute>} />
        <Route path="/deactivated" element={<Deactivated />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
