<script>
  import { hasPermission } from '@/lib/auth';
  import { inertia } from '@inertiajs/svelte';
  export let href = '';
  export let permission = '';

  $: allowed = !permission || hasPermission(permission);
</script>

{#if allowed}
  <a use:inertia {href} {...$$restProps}>
    <slot />
  </a>
{/if}
