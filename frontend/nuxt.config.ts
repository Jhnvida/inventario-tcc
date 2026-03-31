// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@nuxt/fonts"],
  app: { head: { title: "Inventário Inteligente" } },

  fonts: { families: [{ name: "DM Sans", provider: "google" }] },
  css: ["~/assets/css/main.css"],

  routeRules: { "/api/**": { proxy: "http://localhost:3001/**" } },
});
