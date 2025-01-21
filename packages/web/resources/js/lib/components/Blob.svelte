<script>
  import { spline } from '@/lib/spline';
  import { createNoise2D } from 'simplex-noise';
  import { onMount } from 'svelte';
  import { darkMode } from '@/lib/store';

  export let animated = true;
  export let colorful = false;
  let path;
  let svg;

  let hueNoiseOffset = Math.random() * 50;
  let noiseStep = 0.0005;

  const noise2D = createNoise2D();
  const points = createPoints();

  function animate() {
    if (path) {
      path.setAttribute('d', spline(points, 1, true));

      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        const nX = noise(point.noiseOffsetX, point.noiseOffsetX);
        const nY = noise(point.noiseOffsetY, point.noiseOffsetY);
        const x = map(nX, -1, 1, point.originX - 20, point.originX + 20);
        const y = map(nY, -1, 1, point.originY - 20, point.originY + 20);

        point.x = x;
        point.y = y;

        point.noiseOffsetX += noiseStep;
        point.noiseOffsetY += noiseStep;
      }

      hueNoiseOffset += (noiseStep * 10) / 6;

      const hueNoise = noise(hueNoiseOffset, hueNoiseOffset);

      if (colorful) {
        const hue = map(hueNoise, -1, 1, 0, 360);
        svg.style.setProperty('--startColor', `hsl(${hue}, 100%, 75%)`);
        svg.style.setProperty('--stopColor', `hsl(${hue + 60}, 100%, 75%)`);
      } else {
        const brightness = $darkMode === 'dark' ? map(hueNoise, -1, 1, 30, 70) : map(hueNoise, -1, 1, 50, 90);
        svg.style.setProperty('--startColor', `hsl(210, 100%, ${brightness}%)`);
        svg.style.setProperty('--stopColor', `hsl(210, 100%, ${brightness + ($darkMode === 'dark' ? -10 : 40)}%)`);
      }
    }
    if (animated) requestAnimationFrame(animate);
  }

  function map(n, start1, end1, start2, end2) {
    return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
  }

  function noise(x, y) {
    return noise2D(x, y);
  }

  function createPoints() {
    const points = [];
    const numPoints = 6;
    const angleStep = (Math.PI * 2) / numPoints;
    const rad = 75;

    for (let i = 1; i <= numPoints; i++) {
      const theta = i * angleStep;
      const x = 100 + Math.cos(theta) * rad;
      const y = 100 + Math.sin(theta) * rad;

      points.push({
        x,
        y,
        originX: x,
        originY: y,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
      });
    }
    return points;
  }

  onMount(() => {
    animate();
    if (!animated) animate();
  });
</script>

<div {...$$restProps}>
  <svg bind:this={svg} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="gradient" gradientTransform="rotate(90)">
        <stop id="gradientStop1" offset="0%" stop-color="var(--startColor)" />
        <stop id="gradientStop2" offset="100%" stop-color="var(--stopColor)" />
      </linearGradient>
    </defs>

    <!-- Main blob path with gradient fill and outline -->
    <path bind:this={path} d="" fill="url('#gradient')" stroke="var(--accents-300)" stroke-width="1" stroke-linejoin="round" on:mouseover={() => (noiseStep = 0.001)} on:mouseleave={() => (noiseStep = 0.0005)} />
  </svg>
</div>
