// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  runtimeConfig: {
    // Private keys (server-side only)
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: '7d',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://superman:superman@localhost:5432/preblog',

    // Public keys (exposed to client)
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
