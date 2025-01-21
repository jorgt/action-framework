<script>
  import Header from '@/lib/components/Header.svelte';
  import NotificationArea from '@/lib/components/NotificationArea.svelte';
</script>

<div class="top-0 sticky z-50">
  <Header />
</div>
<NotificationArea />
<slot />
