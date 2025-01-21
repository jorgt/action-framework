<script>
  import { hasPermission } from '@/lib/auth';
  export let permission = '';
  export let type = 'button';
  $: allowed = !permission || hasPermission(permission);
</script>

{#if allowed}
  <button {type} {...$$restProps} on:click on:submit on:keydown>
    <slot name="icon"></slot>
    <slot />
  </button>
{:else}
  <!-- Optionally render a disabled button -->
  <!-- <button disabled class="cursor-not-allowed" {...$$restProps}>
    <slot name="icon"></slot>
    <slot />
  </button> -->
{/if}
