<script>
  export let width = 110;
  export let margin = 3;
  let visible = false;
  let element;

  const paths = Array.from({ length: 3 }, () => ({
    x1: Math.random() * 5,
    y1: 7 + Math.random() * 5,
    x2: width - 10 + Math.random() * 4,
    y2: 2 + Math.random() * 5,
    x3: width + Math.random() * 8,
    y3: 2 + Math.random() * 2,
  }));

  import { onMount } from 'svelte';

  onMount(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          visible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  });
</script>

<svg bind:this={element} class="absolute left-0 top-full pt-{margin} -mt-1 w-full h-2 overflow-visible pointer-events-none">
  <g>
    {#each paths as p, i}
      <path class:animate={visible} d={`M ${p.x1},${p.y1} Q ${p.x2},${p.y2} ${p.x3},${p.y3}`} fill="none" stroke="var(--contrast)" stroke-width="4" style="animation-delay: {i * 0.4 + 0.8}s" />
    {/each}
  </g>
</svg>

<style>
  path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }

  .animate {
    animation: dash 0.5s ease-in-out forwards;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
