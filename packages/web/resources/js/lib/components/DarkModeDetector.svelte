<script>
  // @ts-nocheck
  import { browser } from '$app/environment';
  import { darkMode } from '@/lib/store';

  let listening = false;

  function handleSwitchDarkMode(dark) {
    if (browser) {
      document.querySelector('html').dataset.theme = dark ? 'dark' : 'light';
      darkMode.update(d => (d = dark));
    }
  }

  if (browser && !listening) {
    listening = true;
    const mediaQuery = matchMedia('(prefers-color-scheme: dark)');
    const initial = document.querySelector('html')?.dataset?.theme === 'dark' || !!mediaQuery.matches;
    handleSwitchDarkMode(initial);
    mediaQuery.addEventListener('change', e => {
      handleSwitchDarkMode(!!e.matches);
    });
  }
</script>

{#if listening}
  <slot />
{/if}
