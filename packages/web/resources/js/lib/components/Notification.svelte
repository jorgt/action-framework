<script>
  import { X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let remove;
  export let notification;
  const timeout = 5000;

  let percentage = 0;
  let start;
  const types = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  onMount(() => {
    start = performance.now();
    let frame;

    function animate(timestamp) {
      const elapsed = timestamp - start;
      percentage = Math.min((elapsed / timeout) * 100, 100);

      if (percentage < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        remove(notification.id);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  });
</script>

<div class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-accents-900 shadow-lg shadow-accents-400 ring-1 ring-accents-950 ring-opacity-5">
  <div class="p-4">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 {types[notification.type || 'success']}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="ml-3 w-0 flex-1 pt-0.5">
        <p class="text-sm font-medium text-accents-200">{notification.title}</p>
        <p class="mt-1 text-sm text-accents-300">{notification.body}</p>
      </div>
      <div class="ml-4 flex flex-shrink-0 bg-accents-900">
        <button on:click={remove(notification.id)}>
          <span class="sr-only">Close</span>
          <X stroke="currentColor" class="text-accents-100" />
        </button>
      </div>
    </div>
  </div>
  <div class="h-1 bg-accents-800 w-full">
    <div class="h-1 transition-all ease-linear duration-[{timeout}ms] w-full" class:bg-green-600={notification.type === 'success' || !notification.type} class:bg-yellow-600={notification.type === 'warning'} class:bg-red-600={notification.type === 'error'} style="transform: scaleX({percentage / 100}); transform-origin: left"></div>
  </div>
</div>
