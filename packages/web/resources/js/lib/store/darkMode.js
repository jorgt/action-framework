import { writable } from 'svelte/store';
import { router } from '@inertiajs/inertia';

function createThemeStore() {
  const htmlElement = document.documentElement;

  // Initialize the store with the current theme from the <html> tag
  const initialTheme = htmlElement.getAttribute('data-theme') || 'light';
  const { subscribe, set, update } = writable(initialTheme);

  // Observe changes to the <html> tag's data-theme attribute and update store
  const observer = new MutationObserver(() => {
    const newTheme = htmlElement.getAttribute('data-theme') || 'light';
    update(currentTheme => {
      if (currentTheme !== newTheme) {
        return newTheme;
      }
      return currentTheme;
    });
  });

  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return {
    subscribe,
    set: value => {
      // Update the <html> tag's data-theme attribute whenever the store is updated
      htmlElement.setAttribute('data-theme', value);
      set(value);
    },
    toggle: () => {
      // Helper function to toggle between 'dark' and 'light'
      update(current => {
        const newTheme = current === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        return newTheme;
      });
    },
  };
}

const theme = createThemeStore();
export default theme;
