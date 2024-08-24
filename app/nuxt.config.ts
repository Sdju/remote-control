// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/public/styles.css'],
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],
  
  nitro: {
    experimental: {
      websocket: true
    }
  },

  app: {
    head: {
      link: [{ rel: 'icon', href: '/favicon.svg' }]
    }
  },

  pwa: {
    devOptions: {
      enabled: true
    },
    manifest: {
      name: 'PC Controler',
      short_name: 'PC Controler',
      description: 'A simple app to control your PC with your phone.',
      theme_color: '#22c55e',
      background_color: '#111122',
      display: 'standalone',
      orientation: 'portrait',
      icons: [{
        "src": "/favicon.svg",
        "sizes": "150x150",
        "type": "image/svg+xml",
        "purpose": "any"
      }]
    }
  }
})
