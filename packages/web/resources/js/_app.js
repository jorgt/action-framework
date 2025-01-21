console.log('app.js loading...')

import '../css/app.css'
import './bootstrap'

import { createInertiaApp } from '@inertiajs/svelte'
import { router } from '@inertiajs/svelte'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.svelte', { eager: true })
    const page = pages[`./pages/${name}.svelte`]
    console.log('page', page)
    if (!page) {
      throw new Error(`Page ${name} not found`)
    }
    return page.default
  },
  setup({ el, App, props }) {
    new App({ target: el, props })
  },
  progress: {
    color: '#4B5563',
  },
})
