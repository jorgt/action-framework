<script>
  export let classList = '';
  export let value = '';
  export let checked = false;
  export let type = 'text';

  $: baseClasses = type === 'checkbox' 
    ? 'rounded border-accents-300 text-main-500 focus:ring-main-500 bg-accents-200'
    : 'block w-full rounded-md border-0 py-1.5 bg-accents-200 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-500 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6';

  $: classes = classList ? `${baseClasses} ${classList}` : baseClasses;
</script>

{#if type === 'checkbox'}
  <input bind:checked class="{classes}" type="checkbox" {...$$restProps} />
{:else}
  <input bind:value class="{classes}" type="{type}" {...$$restProps} />
{/if}

<style>
  input::-webkit-search-cancel-button {
    display: none;
  }
</style>
