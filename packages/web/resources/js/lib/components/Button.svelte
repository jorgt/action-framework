<script>
  import PermissionButton from '@/lib/components/PermissionButton.svelte';
  export let design = 'Default';
  export let enabled = true;
  export let type = 'button';
  export let permission = null;
  export let size = 'normal';
  export let loading = false;
  export let icon = null;

  const d = {
    None: 'hover:bg-accents-100',
    Default: 'bg-accents-300 text-accents-800 hover:bg-accents-400',
    Emphasised: 'bg-main-500 text-white hover:bg-main-600',
    Error: 'text-red-500 bg-accents-300 hover:bg-red-600 hover:text-white',
    CTA: 'text-accents-900 bg-contrast hover:bg-constrast-highlight hover:text-white',
  };

  const s = {
    small: 'text-xs px-2 py-1',
    normal: 'text-sm px-3 py-2',
    large: 'text-lg px-4 py-3',
  };

  // Compute disabled state based on both enabled prop and loading state
  $: isDisabled = !enabled || loading;
</script>

<PermissionButton {permission} {type} on:click on:submit class="{d[design]} {s[size]} transition-colors duration-300 ease-in-out cursor-pointer relative inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-semibold shadow shadow-accents-200-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600 {loading ? 'cursor-wait' : ''}" disabled={isDisabled} {...$$restProps}>
  <!-- Disabled overlay -->
  <span style="background-color:rgba(0, 0, 0,0.2)" class="{isDisabled ? 'block' : 'hidden'} absolute inset-0 rounded-md {loading ? 'cursor-wait' : 'cursor-not-allowed'}"></span>

  <!-- Content wrapper with fixed dimensions -->
  <span class="flex items-center justify-center w-full whitespace-nowrap">
    <!-- Loading spinner -->
    {#if loading}
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <!-- Icon slot -->
      {#if icon}
        <svelte:component this={icon} class="h-4 w-4 mr-2" />
      {/if}
      <!-- Main content slot -->
      <slot />
    {/if}
  </span>
</PermissionButton>
