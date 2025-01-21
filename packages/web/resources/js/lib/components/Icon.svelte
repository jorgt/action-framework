<script>
  import { icons } from '@/lib/store';
  export let icon = 'add-file-1';
</script>

<span class={$$restProps.class ? $$restProps.class : 'h-6 w-6'}>
  {@html $icons[icon]}
</span>
