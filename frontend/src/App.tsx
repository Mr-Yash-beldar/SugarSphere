import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { theme } from "./theme";
import {
  Layout,
  ProtectedRoute,
  AdminSidebar,
  LoadingScreen,
} from "./components";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  SweetsPage,
  SweetDetailPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  OrderDetailPage,
  ProfilePage,
  NotificationsPage,
  NotFoundPage,
  ServerErrorPage,
  AdminDashboard,
  SweetsManagement,
  UsersManagement,
  OrdersManagement,
} from "./pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkServerConnection = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
      const maxRetries = 10;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const response = await fetch(
            `${API_BASE_URL.replace("/api", "")}/health`
          );
          if (response.ok) {
            setIsServerConnected(true);
            setIsChecking(false);
            return;
          }
        } catch (error) {
          console.log(
            `Server connection attempt ${retries + 1} failed, retrying...`
          );
        }
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Even if server is not responding, show the app after max retries
      setIsChecking(false);
    };

    checkServerConnection();
  }, []);

  if (isChecking) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  if (!isServerConnected) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ServerErrorPage onRetry={() => window.location.reload()} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              iconTheme: {
                primary: "#4caf50",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#f44336",
                secondary: "#fff",
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="sweets" element={<SweetsPage />} />
              <Route path="sweets/:id" element={<SweetDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* Protected User Routes */}
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSidebar>
                      <AdminDashboard />
                    </AdminSidebar>
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/sweets"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSidebar>
                      <SweetsManagement />
                    </AdminSidebar>
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSidebar>
                      <UsersManagement />
                    </AdminSidebar>
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSidebar>
                      <OrdersManagement />
                    </AdminSidebar>
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
