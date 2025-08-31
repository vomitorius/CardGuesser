// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR for client-side camera access
  app: {
    head: {
      title: 'Card Guesser - AI Playing Card Recognition',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-powered playing card recognition using TensorFlow.js and webcam' }
      ]
    }
  }
})
