<script module>
  import layout from '@/lib/layouts/layout.svelte';
  
  export { layout };
</script>
<script>
  import Button from '@/lib/components/Button.svelte';
  import Badge from '@/lib/components/Badge.svelte';
  import socketInstance from '@/lib/socket';
  import { Plus } from 'lucide-svelte'
  import { get, post } from '@/lib/api/api';
  import { onMount, onDestroy } from 'svelte';
  import { Check } from 'lucide-svelte';
  let { entities, stats, logs: initialLogs = [] } = $props();
  let unsubscribeLock;
  let unsubscribeLog;
  let timeout;
  let logs = $state(initialLogs);

  let entityList = $state(entities.map(entity => ({ ...entity, lock: false })).sort((a, b) => a.name.localeCompare(b.name)));

  const startSequence = async (id, sequence_code) => {
    entityList = entityList.map(e => {
      if (e.id === true) {
        return { ...data, lock: true };
      }
      return e;
    });
    try {
      await post(`/api/entity/${id}/sequence`, { sequence_code });
    } catch(e) {
      console.warn(e);
    }
  }

  async function updateEntityLock(entityId, status) {
    if(status.locked) {
      entityList = entityList.map(entity => {
        if (entity.id === entityId) {
          return { ...entity, lock: true };
        }
        return entity;
      });
    } else {
      get(`/api/entity/${entityId}`).then(({ data }) => {
        entityList = entityList.map(e => {
          if (e.id === entityId) {
            return { ...data, lock: false };
          }
          return e;
        });
      });
    }
  }

  onMount(() => {
    const socket = socketInstance.connect()

    // Subscribe to lock events
    unsubscribeLock = socket.subscribeToAllLocks((entityId, status) => {
      updateEntityLock(entityId, status);
    })

    // Subscribe to log events
    unsubscribeLog = socket.subscribeToLogs((logData) => {
      logs = [logData.log, ...logs].slice(0, 50); // Keep last 50 logs
    });

    // timeout = window.setInterval(() => {
    //   const entry = entityList[Math.floor(Math.random() * entityList.length)];
    //   if(entry.sequences.length === 0) return;
    //   startSequence(entry.id, entry.sequences[0].sequence_code);
    // }, 10000);
  })

  onDestroy(() => {
    unsubscribeLock();
    unsubscribeLog();
    socketInstance.disconnect()
    clearInterval(timeout);
  })
</script>

<main>
  <h1 class="text-3xl">Dashboard</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    <div>
      <h2 class="text-xl">Stats</h2>
      {#if stats}
        <div class="grid grid-cols-3 gap-4 mt-2">
          <div>Active Jobs: {stats.active_jobs}</div>
          <div>Waiting Jobs: {stats.waiting_jobs}</div>
          <div>Locked Entities: {stats.locked_entities}</div>
        </div>
      {/if}
    </div>
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
              {#each entityList as { id, name, lock, entity_type, status_code, status_description, sequences }}
                {@const status = lock ? 'Locked' : 'Unlocked'}
                {@const statusColor = lock ? 'Error' : 'Success'}
                <tr class="hover:bg-accents-100 relative">
                  <td class={`border-l-4 ${lock ? 'border-l-accents-500' : 'border-l-accents-300'} border-b border-b-accents-200 py-2 pl-6 pr-8 sm:pl-8 lg:pl-8`}>
                    <div class="font-semibold text-base">{name}</div>
                    {#if lock}
                      <div class="absolute inset-0 bg-accents-300 opacity-50 z-10 cursor-not-allowed"></div>
                    {/if}
                  </td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{entity_type}</td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{status_description} <span class="text-xs text-accents-600">{status_code}</span></td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2 flex gap-3 items-center h-full relative">
                    {#if sequences.length > 0}
                      {#each sequences as { sequence_description, sequence_code }}
                        <Button size="small" on:click={() => startSequence(id, sequence_code)} disabled={lock}>{sequence_description}</Button>
                      {/each}
                    {:else}
                      <span class="py-0.5 text-sm text-accents-600">No actions available</span>
                    {/if}
                  </td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 text-right py-2 text-sm text-accents-700"> <Badge type={statusColor}>{status}</Badge> </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="px-4 pt-10 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold leading-6 text-accents-900">Action log</h1>
          <p class="mt-2 text-sm text-accents-700">The last 100 actions performaned.</p>
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
                <th scope="col" class="w-1/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8">Date</th>
                <th scope="col" class="w-2/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Entity</th>
                <th scope="col" class="w-2/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Action</th>
                <th scope="col" class="w-2/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-left text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Status</th>
                <th scope="col" class="w-1/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-right text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Status change</th>
                <th scope="col" class="w-1/12 sticky top-0 z-10 border-b border-accents-300 bg-accents-50 px-3 py-3.5 text-right text-sm font-semibold text-accents-900 backdrop-blur backdrop-filter">Success</th>
              </tr>
            </thead>
            <tbody>
              {#each logs as { id, created_at, action_name, action_code, entity_name, entity_type, status_code, status_description, result }}
                {@const r = result || {}}
                {@const lock = r?.success}
                {@const status = r?.success ? 'Success' : 'Error'}
                {@const statusColor = r?.success ? 'Success' : 'Error'}             
                <tr class="hover:bg-accents-100">
                  <td class={`border-l-4 ${lock ? 'border-l-accents-500' : 'border-l-accents-300'} border-b border-b-accents-200 py-2 pl-6 pr-8 sm:pl-8 lg:pl-8`}>
                    <div class="font-semibold text-base">{new Date(created_at).toLocaleTimeString()}</div>
                  </td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{entity_name} <span class="text-xs text-accents-600">{entity_type}</span></td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{action_name} <span class="text-xs text-accents-600">{action_code}</span></td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 py-2">{status_description} <span class="text-xs text-accents-600">{status_code}</span></td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 text-right py-2 text-sm text-accents-700">{#if r?.status_changed}<span class="text-green-600"><Check /></span>{/if}</td>
                  <td class="whitespace-nowrap border-b border-accents-200 px-3 text-right py-2 text-sm text-accents-700"> <Badge type={statusColor}>{status}</Badge> </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
</main>
