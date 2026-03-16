// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Inventário Inteligente",
    },
  },
});
