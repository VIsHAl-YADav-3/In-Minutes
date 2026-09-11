import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

// Heavy / less-frequently-visited sections are lazy-loaded to keep the
// initial bundle small (see REQUIREMENTS §53 frontend performance).
const BecomeSeller = lazy(() => import("./pages/BecomeSeller.jsx"));
const SellerLayout = lazy(() => import("./pages/seller/SellerLayout.jsx"));
const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard.jsx"));
const AddFood = lazy(() => import("./pages/seller/AddFood.jsx"));
const ManageFood = lazy(() => import("./pages/seller/ManageFood.jsx"));
const SellerOrders = lazy(() => import("./pages/seller/SellerOrders.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminRestaurants = lazy(() => import("./pages/admin/AdminRestaurants.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));

const PageFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/become-a-seller" element={<ProtectedRoute><BecomeSeller /></ProtectedRoute>} />

            <Route
              path="/seller"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <SellerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SellerDashboard />} />
              <Route path="add-food" element={<AddFood />} />
              <Route path="manage-food" element={<ManageFood />} />
              <Route path="orders" element={<SellerOrders />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
