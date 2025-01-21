import './bootstrap'
import { router } from '@inertiajs/svelte'

// Set up global defaults before createInertiaApp
router.on('before', (event) => {
  try {
    event.detail.options.preserveState = true

    // If only wasn't set, initialize it
    if (!event.detail.options.only) {
      event.detail.options.only = []
    }

    // Always exclude auth from the request
    if (!event.detail.options.only.includes('auth')) {
      event.detail.options.only = [
        ...event.detail.options.only,
        ...Object.keys(window.Inertia.page.props).filter((key) => key !== 'auth'),
      ]
    }
  } catch (e) {
    //
  }
})
