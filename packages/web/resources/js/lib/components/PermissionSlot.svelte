<script>
  import { hasPermission } from '@/lib/auth';
  export let permission = '';

  $: allowed = !permission || hasPermission(permission);
</script>

{#if allowed}
  <slot />
{/if}
