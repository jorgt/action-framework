<script>
  import { fade } from 'svelte/transition';
  export let show = false;

  function close(event) {
    // Check if the click is directly on the overlay
    if (event.target === event.currentTarget) {
      show = false;
    }
  }
</script>

{#if show}
  <div transition:fade={{ duration: 100 }} on:click={close} style="z-index: 99999;" class="fixed inset-0 bg-[#000] bg-opacity-70 flex items-center justify-center">
    <div class="bg-accents-100 border-accents-200 rounded-lg shadow shadow-accents-200 w-[calc(100%-20px)] h-[calc(100vh-50px)] md:w-auto md:h-auto flex flex-col overflow-hidden">
      <div class="p-8 overflow-auto flex-1">
        <slot />
      </div>
    </div>
  </div>
{/if}
