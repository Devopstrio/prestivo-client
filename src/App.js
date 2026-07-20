import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import CurrencyProvider from "./context/CurrencyContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import DevopstrioProtectedRoute from "./routes/DevopstrioProtectedRoute";
import FaviconUpdater from "./components/FaviconUpdater";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserVerification from "./pages/UserVerification";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";
import ShippingManagement from "./components/ShippingManagement";
import DeliveryManagement from "./components/DeliveryManagement";
import WarehouseManagement from "./components/WarehouseManagement";
import NotificationsTab from "./components/NotificationsTab";
import SupportManagement from "./components/SupportManagement";
import Chatbot from "./components/Chatbot";
import WishlistPage from "./components/WishlistPage";
import Contact from "./components/Contact";
import Departments from "./pages/Departments";
import PasswordConfirmation from "./components/PasswordConfirmation";
import DeliveryManager from "./components/DeliveryManager";
import DeliveryEmployeeDashboard from "./components/DeliveryEmployeeDashboard";
import PurchasedepartmentDashboard from "./pages/PurchasedepartmentDashboard";
import ShippingTab from "./components/ShippingTab";
import DeliveryTab from "./components/DeliveryTab";
import CompletedOrdersTab from "./components/CompletedOrdersTab";
import AnalysisTab from "./pages/AnalysisTab";
import StockDetectorTab from "./pages/StockDetectorTab";
import PurchaseProducts from "./pages/PurchaseProducts";
import CreateProfile from "./pages/CreateProfile";
import SubscriptionPlans from "./Subscription/SubscriptionPlans";
import SubscriptionVerification from "./Subscription/SubscriptionVerification";
import ShippingInfo from "./pages/ShippingInfo";
import ReturnsRefunds from "./pages/ReturnsRefunds";
import FAQ from "./pages/FAQ";
import SizeGuide from "./pages/SizeGuide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import InvoiceViewer from "./pages/InvoiceViewer";
import ReturnPolicyRequests from "./pages/ReturnPolicyRequests";
import CategoryPage from "./pages/CategoryPage";
import CancelOrderTab from "./components/CancelOrderTab";
import SupportCancelOrderTab from "./pages/SupportCancelOrderTab";
import VatValidator from "./components/VatValidator";

import MaintenanceSlider, { MaintenanceBlockState } from "./components/MaintenanceSlider";

import DevopstrioLogin from "./Subscription/DevopstrioLogin";
import PaymentDetails from "./pages/PaymentDetails";
import AlertTest from "./components/Alert";
import NotFound from "./components/NotFound";

function App() {

  // Routes that should NOT be blocked
  const allowedDuringMaintenance = [
    "/devopstriologin",
    "/subscriptionverification"
  ];

  const currentPath = window.location.pathname;

  // Only block if path is NOT allowed
  const isMaintBlocked =
    MaintenanceBlockState.isBlocked &&
    !allowedDuringMaintenance.some(route =>
      currentPath.startsWith(route)
    );

  // Auto logout + refresh when blocked
  useEffect(() => {
    if (isMaintBlocked) {
      if (allowedDuringMaintenance.some(route => currentPath.startsWith(route))) {
      console.log("Allowed route → No auto refresh");
      return;
    }
      console.log("Maintenance active → auto logout + block");

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");

      window.location.href = "/";

      const interval = setInterval(() => {
        console.log("Maintenance still active → auto-refresh triggered");
        window.location.reload();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isMaintBlocked]);


  return (
    <AuthProvider>
      <CartProvider>
        <CurrencyProvider>
          <ToastContainer position="top-center" />

          <Router>
            <FaviconUpdater />

            {/* Always show slider */}
            <MaintenanceSlider />

            <Routes>

              {/* Allowed routes (never blocked) */}
              <Route path="/devopstriologin" element={<DevopstrioLogin />} />
              <Route path="/subscriptionverification" element={
                <DevopstrioProtectedRoute>
                  <SubscriptionVerification />
                </DevopstrioProtectedRoute>
              }
              />

              {/* Block all routes (except allowed ones) */}
              {isMaintBlocked ? (
                <Route path="*" element={<MaintenanceSlider />} />
              ) : (
                <>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/adminlogin" element={<AdminLogin />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/passwordconfirmation" element={<PasswordConfirmation />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/userverification" element={<UserVerification />} />
                  <Route path="/createprofile" element={<CreateProfile />} />
                  <Route path="/subscription" element={<SubscriptionPlans />} />
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                  <Route path="/returns" element={<ReturnsRefunds />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/category/:categoryName" element={<CategoryPage />} />
                  <Route path="/vat" element={<VatValidator />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}

              {/* Protected Routes */}
              {[
                { path: "/deliveryemployee", element: <DeliveryEmployeeDashboard /> },
                { path: "/deliverymanager", element: <DeliveryManager /> },
                { path: "/checkout", element: <Checkout /> },
                { path: "/orderconfirmation", element: <OrderConfirmation /> },
                { path: "/profile", element: <Profile /> },
                { path: "/myorders", element: <MyOrders /> },
                { path: "/admin", element: <AdminDashboard /> },
                { path: "/shippingmanagement", element: <ShippingManagement /> },
                { path: "/deliverymanagement", element: <DeliveryManagement /> },
                { path: "/warehousemanagement", element: <WarehouseManagement /> },
                { path: "/supportmanagement", element: <SupportManagement /> },
                { path: "/wishlist", element: <WishlistPage /> },
                { path: "/departments", element: <Departments /> },
                { path: "/notifications", element: <NotificationsTab /> },
                { path: "/purchasedepartmentmanagement", element: <PurchasedepartmentDashboard /> },
                { path: "/shipping", element: <ShippingTab /> },
                { path: "/delivery", element: <DeliveryTab /> },
                { path: "/completedorders", element: <CompletedOrdersTab /> },
                { path: "/analysis", element: <AnalysisTab /> },
                { path: "/stockdetector", element: <StockDetectorTab /> },
                { path: "/purchaseproducts", element: <PurchaseProducts /> },
                { path: "/invoiceviewer", element: <InvoiceViewer /> },
                { path: "/return-policy", element: <ReturnPolicyRequests /> },
                { path: "/cancelorder", element: <CancelOrderTab /> },
                { path: "/supportcancelorder", element: <SupportCancelOrderTab /> },
              ].map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    isMaintBlocked ? (
                      <MaintenanceSlider />
                    ) : (
                      <ProtectedRoute>{element}</ProtectedRoute>
                    )
                  }
                />
              ))}

            </Routes>
          </Router>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
