import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/fraunces/latin-700.css";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/hind/latin-400.css";
import "@fontsource/hind/latin-600.css";
import "@fontsource/hind/latin-700.css";
import "@fontsource/hind/devanagari-400.css";
import "@fontsource/hind/devanagari-600.css";
import "@fontsource/hind/devanagari-700.css";
import "./index.css";
import App from "./App.tsx";
import { StoreProvider } from "./store.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Root element missing");

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
