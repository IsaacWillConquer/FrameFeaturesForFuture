import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./core/auth/AuthProvider";
import { A11yProvider } from "./core/a11y/A11yProvider";
import { I18nProvider } from "./core/i18n/I18nProvider";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

// PWA: register the service worker in production only. In dev it would cache
// hashed assets and fight the Vite dev server.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// <StrictMode> is left out on purpose. In dev it runs every effect twice, and that makes the
// camera QR scanner (html5-qrcode) try to start two cameras on the same element and error out.
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <A11yProvider>
        <I18nProvider>
          <AppRoutes />
        </I18nProvider>
      </A11yProvider>
    </AuthProvider>
  </BrowserRouter>
);
