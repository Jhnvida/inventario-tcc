export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@nuxt/fonts"],
    app: { head: { title: "Inventário Inteligente" } },

    icon: { provider: "iconify" },
    fonts: { families: [{ name: "DM Sans", provider: "google" }] },
    css: ["~/assets/css/main.css"],

    routeRules: { "/api/**": { proxy: "http://localhost:3001/**" } },
});
