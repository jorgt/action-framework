<script>
  import Notification from './Notification.svelte';
  import { notifications } from '@/lib/store';

  function removeNotification(id) {
    notifications.removeNotification(id);
  }
</script>

<div style="z-index: 999999;" aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50">
  <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
    <!--
      Notification panel, dynamically insert this into the live region when it needs to be displayed

      Entering: "transform ease-out duration-300 transition"
        From: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        To: "translate-y-0 opacity-100 sm:translate-x-0"
      Leaving: "transition ease-in duration-100"
        From: "opacity-100"
        To: "opacity-0"
    -->
    {#each $notifications as notification (notification.id)}
      <Notification {notification} remove={removeNotification} />
    {/each}
  </div>
</div>
