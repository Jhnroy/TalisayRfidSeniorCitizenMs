
import { createBrowserRouter, Navigate } from "react-router-dom";


// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import LandingPage from "../pages/LandingPage";
import Login from "../pages/admin/Login";
import SignUp from "../pages/admin/SignUp";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Registrant from "../pages/admin/Registrant";
import Masterlist from "../pages/admin/Masterlist";
import RFIDBinding from "../pages/admin/RfidBinding";
import Validation from "../pages/admin/Validation";
import Pension from "../pages/admin/Pension";
import Calendar from "../pages/admin/Calendar";
import Settings from "../pages/admin/Settings";
import NotFound from "../pages/NotFound"; //  Added custom 404 page

// ==============================
// 🔒 Protected Route Component
// ==============================


// ==============================
// 📌 Routes Setup
// ==============================
const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />, // ✅ Added
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
  {
    path: "/admin",
    element: <AuthLayout />,
    errorElement: <NotFound />, // ✅ Added
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "registrant",
        element: (
          <ProtectedRoute>
            <Registrant />
          </ProtectedRoute>
        ),
      },
      {
        path: "rfid-binding",
        element: (
          <ProtectedRoute>
            <RFIDBinding />
          </ProtectedRoute>
        ),
      },
      {
        path: "pension",
        element: (
          <ProtectedRoute>
            <Pension />
          </ProtectedRoute>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        ),
      },
      {
        path: "masterlist",
        element: (
          <ProtectedRoute>
            <Masterlist />
          </ProtectedRoute>
        ),
      },

      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "validation",
        element: (
          <ProtectedRoute>
            <Validation />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // ✅ Catch-all route for undefined URLs
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default routes;
