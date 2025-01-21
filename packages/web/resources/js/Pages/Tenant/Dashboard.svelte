<script module>
  import layout from '@/lib/layouts/layout.svelte';
  
  export { layout };
</script>
<script>
  import Button from '@/lib/components/Button.svelte';
  import Badge from '@/lib/components/Badge.svelte';
  import { api } from '@/lib/api';
  import { Plus } from 'lucide-svelte'
  import { inertiaPost } from '@/lib/api';

	let { entities, stats } = $props();

  const formatDate = date => {
    return new Date(date).toLocaleDateString(window.navigator.language || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const startSequence = async (id, sequence_code) => {
    console.log('Starting sequence:', id, sequence_code);
    try {
      await inertiaPost({url: `/api/entity/${id}/sequence`, data: { sequence_code }});
    } catch(e) {
      console.warn(e);
    }
  }

  console.log('Dashboard component loaded');
  console.log('Props:', { entities, stats });
</script>

<main>
  <h1 class="text-3xl">Dashboard</h1>
  
  <div class="mt-4">
    <h2 class="text-xl">Stats</h2>
    {#if stats}
      <div class="grid grid-cols-3 gap-4 mt-2">
        <div>Active Jobs: {stats.active_jobs}</div>
        <div>Waiting Jobs: {stats.waiting_jobs}</div>
        <div>Locked Entities: {stats.locked_entities}</div>
      </div>
    {/if}
  </div>

    <div class="px-4 pt-10 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold leading-6 text-accents-900">Campaigns</h1>
          <p class="mt-2 text-sm text-accents-700">These are the last campaigns your organisation has created.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button permission="campaign.create" design="Emphasised" on:click={() => router.visit(`/campaigns`)} icon={Plus}>Add campaign</Button>
        </div>
      </div>

      <!-- Desktop/Tablet View -->
      <div class="mt-8 hidden sm:block">
        <div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <table class="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" class="w-3/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">Title</th>
                <th scope="col" class="w-1/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Type</th>
                <th scope="col" class="w-4/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 text-left px-3 py-3.5 text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Status</th>
                <th scope="col" class="w-4/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 text-left px-3 py-3.5 text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Available actions</th>
                <th scope="col" class="w-2/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-right text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">State</th>
              </tr>
            </thead>
            <tbody>
              {#each entities as { id, name, locked, entity_type, status_code, status_description, sequences }}
                {@const status = locked ? 'Locked' : 'Unlocked'}
                {@const statusColor = locked ? 'Error' : 'Success'}
                <tr class="hover:bg-accents-100">
                  <td class={`border-l-4 ${locked ? 'border-l-accents-500' : 'border-l-accents-300'} border-b border-b-accents-200 py-2 pl-6 pr-8 sm:pl-8 lg:pl-8`}>
                    <div class="font-semibold text-base">{name}</div>
                  </td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{entity_type}</td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{status_description} <span class="text-xs text-accents-600">{status_code}</span></td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2 flex gap-3 items-center h-full">
                    {#if sequences.length > 0}
                      {#each sequences as { sequence_description, sequence_code }}
                        <Button size="small" on:click={() => startSequence(id, sequence_code)}>{sequence_description}</Button>
                      {/each}
                    {:else}
                      <span class="text-sm text-accents-600">No actions available</span>
                    {/if}
                  </td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 text-right py-2 text-sm text-accents-700"> <Badge type={statusColor}>{status}</Badge> </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View -->
      <div class="mt-8 sm:hidden">
        {#each entities as { id, name, created_at, active }}
          <button class="-mx-4 divide-accents-200 text-left w-full">
            <div class="border-l-4 px-4 py-2 {active > 0 ? 'border-l-accents-500' : 'border-l-accents-300'}">
              <div class="text-left">
                <div class="font-semibold text-base mb-2">{name}</div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="col-span-2 text-left">
                    <span class="text-accents-600">Created:</span>
                    <span class="ml-2 text-accents-900">{formatDate(created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
</main>
