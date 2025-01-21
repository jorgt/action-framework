<script>
  export let direction = 'down';
</script>

<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style:transform={direction === 'up' ? 'rotate(180deg)' : 'none'}>
  <path d="M6 9l6 6 6-6" />
</svg>
