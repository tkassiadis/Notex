// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── Registro do Service Worker ────────────────────────────────
// Auto-atualização: quando uma versão nova é detectada, ela é ativada
// e a página recarrega automaticamente (uma única vez).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service Worker registrado:", registration.scope);

        // Procura ativamente por uma versão nova assim que o app abre
        registration.update();

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Há uma versão nova esperando — manda ativar imediatamente
              console.log("[PWA] Nova versão encontrada, atualizando...");
              newWorker.postMessage("SKIP_WAITING");
              registration.waiting?.postMessage("SKIP_WAITING");
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker falhou:", err);
      });

    // Quando o novo Service Worker assume o controle, recarrega a página
    // uma única vez para carregar o código novo.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}
