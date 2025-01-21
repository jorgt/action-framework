<script>
  export let title = '';
  export let className = '';
  export let icon = null;
</script>

<div class="bg-accents-50 rounded-lg border border-accents-200 p-6 {className}">
  <div class="flex items-center justify-between">
    {#if title}
      <h3 class="text-base font-medium text-accents-800">{title}</h3>
    {/if}
    {#if icon}
      <div class="text-accents-400">
        <svelte:component this={icon} />
      </div>
    {/if}
  </div>
  <slot />
</div>
