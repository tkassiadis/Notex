// ============================================================
// public/sw.js — Service Worker
// Controle do Semestre
//
// Estratégias:
//   App shell (JS/CSS/HTML)  → Cache First  (instala no primeiro load)
//   Fontes Google            → Cache First  (stale-while-revalidate)
//   Supabase API             → Network First (dados sempre frescos)
//   Tudo mais                → Network First com fallback
// ============================================================

const CACHE_NAME    = "controle-semestre-v1";
const SHELL_CACHE   = "controle-semestre-shell-v1";
const FONT_CACHE    = "controle-semestre-fonts-v1";

// Recursos do app shell — cacheados na instalação
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
];

// ─── INSTALL ─────────────────────────────────────────────────
// Pré-cacheia o app shell para garantir funcionamento offline
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        // Falha silenciosa: não bloqueia instalação se um asset falhar
        console.warn("[SW] Shell cache parcial:", err);
      });
    }).then(() => {
      // Ativa imediatamente sem esperar fechar a aba anterior
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────
// Remove caches de versões anteriores
self.addEventListener("activate", (event) => {
  const validCaches = [CACHE_NAME, SHELL_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => {
            console.log("[SW] Removendo cache antigo:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests não-GET (POST, PUT, DELETE para Supabase)
  if (request.method !== "GET") return;

  // Ignora extensões do browser e requests de outros origins sem relevância
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ── 1. Supabase API → Network First, sem cache ──────────────
  // Dados do banco devem sempre vir frescos
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(networkFirst(request, CACHE_NAME, false));
    return;
  }

  // ── 2. Google Fonts → Cache First (raro mudar) ──────────────
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // ── 3. App shell (HTML, JS, CSS, SVG) → Cache First ─────────
  if (
    url.origin === self.location.origin &&
    (
      url.pathname === "/" ||
      url.pathname.endsWith(".html") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.json"
    )
  ) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // ── 4. Tudo mais → Network First com fallback ───────────────
  event.respondWith(networkFirst(request, CACHE_NAME, true));
});

// ─── ESTRATÉGIAS ─────────────────────────────────────────────

/**
 * Cache First: serve do cache; se não tiver, busca na rede e armazena.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline e sem cache: retorna 503 genérico
    return new Response("Offline — recurso não disponível", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Network First: tenta a rede; se falhar, serve do cache.
 * Se useCache = false, não armazena no cache (para APIs).
 */
async function networkFirst(request, cacheName, useCache) {
  try {
    const response = await fetch(request);
    if (useCache && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (useCache) {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    // Fallback offline: retorna index.html para navegação SPA
    const fallback = await caches.match("/index.html");
    if (fallback) return fallback;

    return new Response("Você está offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// ─── BACKGROUND SYNC (futuro) ────────────────────────────────
// Placeholder para sincronização quando reconectar
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-atividades") {
    console.log("[SW] Background sync disparado:", event.tag);
    // Implementar na Fase 4 junto com Supabase realtime
  }
});
