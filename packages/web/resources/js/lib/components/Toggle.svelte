<script>
  import PermissionButton from '@/lib/components/PermissionButton.svelte';
  import { createEventDispatcher } from 'svelte';
  export let enabled = false;
  export let permission = null;

  const dispatch = createEventDispatcher();
  $: dispatch('click', enabled);
</script>

<PermissionButton {permission} on:click={() => (enabled = !enabled)} type="button" class="bg-accents-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-main-600 focus:ring-offset-2" role="switch" aria-checked="false">
  <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
  <span class="{enabled ? 'translate-x-5 bg-main-400 text-white' : 'translate-x-0 bg-accents-100 text-accents-300'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full shadow shadow-accents-200 ring-0 transition duration-200 ease-in-out">
    <span class="{enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity" aria-hidden="true">
      <svg class="h-3 w-3 text-accents-800" fill="none" viewBox="0 0 12 12">
        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>

    <span class="{enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity" aria-hidden="true">
      <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
      </svg>
    </span>
  </span>
</PermissionButton>
