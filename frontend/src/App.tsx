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
import ChatProvider from "./features/chat/ChatProvider";
import ChatWidget from "./features/chat/ChatWidget";

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    let observer: MutationObserver | null = null;
    let timeoutId: number | undefined;

    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      target.scrollIntoView({ behavior, block: "start" });
      observer?.disconnect();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      return true;
    };

    if (!scrollToTarget()) {
      observer = new MutationObserver(scrollToTarget);
      observer.observe(document.body, { childList: true, subtree: true });
      timeoutId = window.setTimeout(() => observer?.disconnect(), 4_000);
    }

    return () => {
      observer?.disconnect();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [pathname, search, hash]);

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
    <div className="flex min-h-[100svh] min-w-0 flex-col overflow-x-clip">
      <Header />
      <main className="min-w-0 flex-grow pt-9">
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
          <ChatProvider>
            <ScrollToTop />
            <AppLayout />
            <ChatWidget />
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
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
