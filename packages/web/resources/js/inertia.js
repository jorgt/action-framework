import './bootstrap'
import { createInertiaApp } from '@inertiajs/svelte'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { router } from '@inertiajs/svelte'
import { mount } from 'svelte'

import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('axios:error', error)
    if ([401, 419].includes(error.response?.status)) {
      router.visit('/login')
    }
    return Promise.reject(error)
  }
)

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.svelte', { eager: true })
    const page = pages[`./pages/${name}.svelte`]

    // console.log(page)
    // console.log(page.default)

    if (!page) {
      throw new Error(`Page not found: ${name}`)
    }
    return page
  },
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  },
  visitOptions: {
    protocol: window.location.protocol,
    preserveState: true,
  },
  progress: {
    delay: 0,
    color: 'var(--main-400)',
    includeCSS: true,
  },
})
