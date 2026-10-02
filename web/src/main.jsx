import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./core/auth/AuthProvider";
import { A11yProvider } from "./core/a11y/A11yProvider";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

// <StrictMode> is left out on purpose. In dev it runs every effect twice, and that makes the
// camera QR scanner (html5-qrcode) try to start two cameras on the same element and error out.
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <A11yProvider>
        <AppRoutes />
      </A11yProvider>
    </AuthProvider>
  </BrowserRouter>
);
