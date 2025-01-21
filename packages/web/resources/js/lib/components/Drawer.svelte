<script>
  import { slide } from 'svelte/transition';
  export let show = false;
  export let left = true;
  export let width = 'w-96';
</script>

<div on:click={() => (show = false)} style="z-index: 9999;" class="top-0 w-screen h-screen fixed bg-[#000] bg-opacity-70 {show ? 'display' : 'hidden'}"></div>

{#if show}
  <div transition:slide={{ delay: 0, duration: 50, axis: 'x' }} style="z-index: 99999;" class="{left ? 'left-0' : 'right-0'} shadow shadow-accents-200-md top-0 h-screen {width} fixed bg-accents-100 border-r border-accents-200 {show ? 'display' : 'hidden'}">
    <!-- <div class="cursor-pointer h-6 w-6 hover:bg-main-800 rounded-md top-1 absolute right-[-30px]" on:click={() => show = false}>
      <span class="h-6 w-4"><Icon class="h-4 w-4" icon="cross" /></span>
    </div> -->
    <div class="p-2 h-screen">
      <slot />
    </div>
  </div>
{/if}
