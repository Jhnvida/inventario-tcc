export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@nuxt/fonts"],
  app: { head: { title: "Inventário Inteligente" } },

  icon: {
    provider: "iconify",
    clientBundle: {
      scan: true,
      icons: [
        "lucide:clipboard-check",
        "lucide:package",
        "lucide:circle-dollar-sign",
        "lucide:triangle-alert",
        "lucide:search",
        "lucide:plus",
        "lucide:filter",
        "lucide:arrow-right",
        "lucide:arrow-left",
        "lucide:more-vertical",
        "lucide:edit-2",
        "lucide:trash",
        "lucide:history",
        "lucide:layout-dashboard",
        "lucide:shopping-cart",
        "lucide:users",
        "lucide:log-out",
      ],
    },
  },

  fonts: { families: [{ name: "DM Sans", provider: "google" }] },
  css: ["~/assets/css/main.css"],

  routeRules: { "/api/**": { proxy: "http://localhost:3001/**" } },
});
