<script>
  import { router } from '@inertiajs/svelte';
  import { onError } from 'svelte';

  let error = null;

  onError(e => {
    error = e;
    router.visit('/error', {
      data: {
        status: 500,
        error: {
          message: 'Application Error',
          description: import.meta.env.DEV ? e.message : 'An unexpected error occurred',
        },
      },
    });
  });
</script>

{#if error}
  <!-- Error was caught -->
  <p>Redirecting to error page...</p>
{:else}
  <slot />
{/if}
