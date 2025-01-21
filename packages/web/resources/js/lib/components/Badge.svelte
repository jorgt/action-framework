<script>
  export let type = 'Error';

  const styles = {
    Error: 'bg-red-700 text-red-100 ring-red-600',
    Success: 'bg-green-700 text-green-100 ring-green-600',
    Warning: 'bg-yellow-700 text-yellow-100 ring-yellow-600',
    Default: 'bg-accents-300 text-accents-800 ring-accents-500',
    Main: 'bg-main-700 text-main-100 ring-main-600',
  };
</script>

<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset {styles[type]}">
  <span class="text-[0.8em] uppercase"><slot /></span>
</span>
