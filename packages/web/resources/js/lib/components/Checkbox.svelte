<script>
  export let checked = false; // Default to unchecked

  // Bind `checked` directly to manage the state
</script>

<input type="checkbox" bind:checked class="h-4 w-4 bg-accents-300 rounded border-accents-300 text-main-500 focus:ring-main-500" {...$$restProps} />
