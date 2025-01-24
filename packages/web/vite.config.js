import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js', 'resources/js/inertia.js', 'resources/js/darkmode.js'],
      ssr: 'resources/js/ssr.js',
      refresh: true,
    }),
    svelte({
      onwarn: (warning, handler) => {
        if (warning.code.startsWith('a11y')) {
          return;
        }
        handler(warning);
      },
    }),
  ],
  resolve: {
    alias: {
      $lib: '/resources/js/lib',
    },
  },
  optimizeDeps: {
    include: ['@inertiajs/svelte'],
  },
});
