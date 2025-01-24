import { router } from '@inertiajs/svelte';

async function setTheme(userPreference) {
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  try {
    // JS
    document.cookie = `visitor_preferences=${JSON.stringify({ theme: userPreference })}; path=/; max-age=31536000`;
  } catch (error) {
    console.error('Error setting theme:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const updateTheme = async mediaQuery => {
    const userPreference = mediaQuery.matches ? 'dark' : 'light';
    const currentTheme = document.documentElement.getAttribute('data-theme');

    document.documentElement.setAttribute('data-theme', userPreference);

    if (userPreference !== currentTheme) {
      await setTheme(userPreference);
    }
  };

  // Initial theme check
  updateTheme(darkModeMediaQuery);

  // Listen for system theme changes
  darkModeMediaQuery.addEventListener('change', updateTheme);
});
