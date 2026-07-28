import { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Header from "./components/feature/Header";
import Footer from "./components/feature/Footer";
import { AuthProvider } from "./features/auth/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useScrollReveal from "./hooks/useScrollReveal";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/forgot-password" || location.pathname === "/reset-password";
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname.startsWith("/dashboard");
  const isUserPanel = location.pathname.startsWith("/user");

  if (isLanding) {
    return <AppRoutes />;
  }

  if (isAdmin || isUserPanel) {
    return <AppRoutes />;
  }

  return <PublicLayout />;
}

function PublicLayout() {
  useScrollReveal();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-9">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AuthProvider>
          <ScrollToTop />
          <AppLayout />
          <ToastContainer
            position="top-right"
            autoClose={3500}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
