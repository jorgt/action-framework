<script>
  import Caret from './Caret.svelte';
  import { slide } from 'svelte/transition';

  export let isOpen = false;
</script>

<div on:click={() => (isOpen = !isOpen)} class="cursor-pointer flex justify-between items-center">
  <slot name="trigger">
    <button>Toggle</button>
  </slot>
  <Caret direction={isOpen ? 'down' : 'up'} />
</div>

{#if isOpen}
  <div transition:slide={{ duration: 100 }}>
    <slot />
  </div>
{/if}
