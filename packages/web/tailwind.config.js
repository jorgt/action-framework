import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.svelte',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', ...defaultTheme.fontFamily.sans],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.accents-800'),
            '--tw-prose-headings': theme('colors.accents-800'),
            '--tw-prose-lead': theme('colors.accents-800'),
            '--tw-prose-links': theme('colors.accents-800'),
            '--tw-prose-bold': theme('colors.accents-800'),
            '--tw-prose-counters': theme('colors.accents-800'),
            '--tw-prose-bullets': theme('colors.accents-800'),
            '--tw-prose-hr': theme('colors.accents-200'),
            '--tw-prose-quotes': theme('colors.accents-800'),
            '--tw-prose-quote-borders': theme('colors.accents-800'),
            '--tw-prose-captions': theme('colors.accents-800'),
            '--tw-prose-code': theme('colors.accents-800'),
            '--tw-prose-pre-code': theme('colors.accents-800'),
            '--tw-prose-pre-bg': theme('colors.accents-200'),
            '--tw-prose-th-borders': theme('colors.accents-800'),
            '--tw-prose-td-borders': theme('colors.accents-800'),
          },
        },
      }),
      zIndex: {
        4: '4',
        5: '5',
        3: '3',
        2: '2',
        1: '1',
      },
      maxWidth: {
        '8xl': '1920px',
      },
      colors: {
        hover: 'var(--hover)',
        'hover-1': 'var(--hover-1)',
        'hover-2': 'var(--hover-2)',
        'accents-50': 'var(--accents-50)',
        'accents-100': 'var(--accents-100)',
        'accents-200': 'var(--accents-200)',
        'accents-300': 'var(--accents-300)',
        'accents-400': 'var(--accents-400)',
        'accents-500': 'var(--accents-500)',
        'accents-600': 'var(--accents-600)',
        'accents-700': 'var(--accents-700)',
        'accents-800': 'var(--accents-800)',
        'accents-900': 'var(--accents-900)',
        'accents-950': 'var(--accents-950)',
        'acid-secondary': 'var(--acid-secondary)',
        'main-50': 'var(--main-50)',
        'main-100': 'var(--main-100)',
        'main-200': 'var(--main-200)',
        'main-300': 'var(--main-300)',
        'main-400': 'var(--main-400)',
        'main-500': 'var(--main-500)',
        'main-600': 'var(--main-600)',
        'main-700': 'var(--main-700)',
        'main-800': 'var(--main-800)',
        'main-900': 'var(--main-900)',
        'main-950': 'var(--main-950)',
        contrast: 'var(--contrast)',
        'contrast-highlight': 'var(--contrast-highlight)',
      },
      boxShadow: {
        'outline-2': '0 0 0 2px var(--accents-2)',
        magical:
          'rgba(0, 0, 0, 0.02) 0px 30px 30px, rgba(0, 0, 0, 0.03) 0px 0px 8px, rgba(0, 0, 0, 0.05) 0px 1px 0px',
      },
      lineHeight: {
        'extra-loose': '2.2',
      },
      letterSpacing: {
        widest: '0.3em',
      },
    },
  },

  plugins: [forms, typography],
}
