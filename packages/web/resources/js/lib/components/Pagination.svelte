<script>
  import PermissionLink from '@/lib/components/PermissionLink.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let meta = {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    links: [],
  };

  function handlePageChange(page) {
    dispatch('pageChange', { page });
  }
</script>

<div class="mt-4 flex items-center justify-between px-4 py-3 sm:px-6">
  <div class="flex flex-1 justify-between sm:hidden">
    {#if meta.current_page !== 1}
      <button on:click={() => handlePageChange(meta.current_page - 1)} class="relative inline-flex items-center rounded-md border border-accents-300 bg-accents-50 px-4 py-2 text-sm font-medium text-accents-700 hover:bg-accents-50"> Previous </button>
    {:else}
      <span class="relative inline-flex items-center rounded-md border border-accents-300 bg-accents-50 px-4 py-2 text-sm font-medium text-accents-400"> Previous </span>
    {/if}

    {#if meta.current_page !== meta.last_page}
      <button on:click={() => handlePageChange(meta.current_page + 1)} class="relative ml-3 inline-flex items-center rounded-md border border-accents-300 bg-accents-50 px-4 py-2 text-sm font-medium text-accents-700 hover:bg-accents-50"> Next </button>
    {:else}
      <span class="relative ml-3 inline-flex items-center rounded-md border border-accents-300 bg-accents-50 px-4 py-2 text-sm font-medium text-accents-400"> Next </span>
    {/if}
  </div>

  <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
    <div>
      <p class="text-sm text-accents-700">
        Showing
        <span class="font-medium">{(meta.current_page - 1) * meta.per_page + 1}</span>
        to
        <span class="font-medium">{Math.min(meta.current_page * meta.per_page, meta.total)}</span>
        of
        <span class="font-medium">{meta.total}</span>
        results
      </p>
    </div>

    {#if meta.links && meta.links.length > 3}
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow shadow-accents-200-sm" aria-label="Pagination">
          {#each meta.links.slice(1, -1) as link}
            {#if link.url}
              <button on:click={() => handlePageChange(parseInt(new URL(link.url).searchParams.get('page')))} class="relative inline-flex items-center px-4 py-2 text-sm font-semibold {link.active ? 'z-10 bg-main-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600' : 'text-accents-900 ring-1 ring-inset ring-accents-300 hover:bg-accents-50 focus:z-20 focus:outline-offset-0'}">
                {@html link.label}
              </button>
            {:else}
              <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-accents-700 ring-1 ring-inset ring-accents-300">
                {@html link.label}
              </span>
            {/if}
          {/each}
        </nav>
      </div>
    {/if}
  </div>
</div>
