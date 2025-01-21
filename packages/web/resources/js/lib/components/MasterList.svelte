<!-- MasterList.svelte -->
<script>
  export let isSidebarOpen;
  export let title = undefined;
  export let subtitle = undefined;
</script>

<div class="relative flex h-full">
  <!-- Sidebar -->
  <div
    class="fixed lg:relative bg-accents-50 shadow shadow-accents-200-md flex flex-col overflow-hidden transition-all duration-300 ease-in-out h-[calc(100vh-68px)] z-30
              {$isSidebarOpen ? 'w-4/5 lg:w-[400px] translate-x-0' : '-translate-x-full lg:w-0 lg:translate-x-0'}"
    style="min-width: {$isSidebarOpen ? '' : '0'}">
    <!-- Header -->
    <div class="flex-none px-4 py-6 sm:px-6 border-b border-accents-200">
      {#if title}
        <h1 class="text-base font-semibold leading-6 text-accents-900">{title}</h1>
        {#if subtitle}
          <p class="mt-2 text-sm text-accents-700">{subtitle}</p>
        {/if}
      {/if}
      <slot name="header" />
    </div>

    <!-- Main content slot -->
    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>

    <!-- Footer slot -->
    <div class="px-4 py-4 flex-none border-t border-accents-200">
      <slot name="footer" />
    </div>
  </div>

  <!-- Toggle button -->
  <button class="fixed h-10 px-1 mt-10 bg-accents-50 hover:bg-accents-100 border-y border-r border-accents-200 rounded-r-md shadow shadow-accents-200-sm transition-transform duration-300 z-30 {$isSidebarOpen ? 'translate-x-[80vw] lg:translate-x-[400px]' : 'translate-x-0'}" on:click={() => ($isSidebarOpen = !$isSidebarOpen)}>
    {#if $isSidebarOpen}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    {/if}
  </button>

  <!-- Mobile overlay backdrop -->
  {#if $isSidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20" on:click={() => ($isSidebarOpen = false)}></div>
  {/if}
</div>
