<script>
  import Logo from '@/lib/components/Logo.svelte';
  import Blob from '@/lib/components/Blob.svelte';
  import { darkMode } from '@/lib/store.js';
  import { onMount } from 'svelte';
  import PermissionLink from '../PermissionLink.svelte';

  export let tenant = false;

  let blobs = [];

  function generateRandomBlobs() {
    const generatedBlobs = [];
    const maxAttempts = 100;

    function isOverlapping(newBlob, existingBlobs) {
      return existingBlobs.some(blob => {
        const margin = 0.3;
        const newBlobMargin = newBlob.size * (1 + margin);
        const blobMargin = blob.size * (1 + margin);
        const distance = Math.hypot(newBlob.left - blob.left, newBlob.top - blob.top);
        const minDistance = (newBlobMargin + blobMargin) / 2;
        return distance < minDistance;
      });
    }

    for (let i = 0; i < 4; i++) {
      let attempts = 0;
      let newBlob;

      do {
        const size = Math.random() * 200 + 500;
        const top = Math.random() * (window.innerHeight - size);
        const left = Math.random() * (window.innerWidth - size);

        newBlob = { top, left, size };

        attempts++;
      } while (isOverlapping(newBlob, generatedBlobs) && attempts < maxAttempts);

      if (attempts < maxAttempts) {
        generatedBlobs.push(newBlob);
      }
    }

    blobs = generatedBlobs;
  }

  function scrollToContent() {
    const contentSection = document.getElementById('more');
    contentSection?.scrollIntoView({ behavior: 'smooth' });
  }

  onMount(() => {
    generateRandomBlobs();
  });
</script>

<div class="bg-accents-50">
  <!-- Header -->
  <header class="absolute inset-x-0 top-0 z-50">
    <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div class="flex lg:flex-1">
        <PermissionLink href="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Your Company</span>
          <Logo />
        </PermissionLink>
      </div>
    </nav>
  </header>

  <main class="isolate">
    <!-- Hero section -->
    <div class="relative h-screen flex items-center justify-center">
      <!-- Top Blob -->
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[var(--from)] to-[var(--to)] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>

      <!-- Blob positioned exactly in the center of the screen -->
      <div class="absolute inset-0 flex items-center justify-center -z-20">
        <div class="w-2/3">
          <Blob />
        </div>
      </div>

      <!-- Centered content -->
      <div class="text-center z-10 max-w-2xl px-6">
        <h1 class="text-4xl font-bold tracking-tight sm:text-8xl">Surveys for your business</h1>
        <p class="mt-6 text-2xl leading-8 text-accents-800">Create and send surveys, build your corporate branding. Integrate with your favorite tools using our API's and webhooks.</p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <PermissionLink href={tenant ? '/login' : '/signup'} class="rounded-md bg-contrast px-3.5 py-2.5 text-sm font-semibold text-white shadow shadow-accents-200-sm hover:bg-contrast-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-400">Create a survey</PermissionLink>
          <PermissionLink href="#more" class="text-sm font-semibold leading-6 text-accents-900">
            Learn more <span aria-hidden="true">→</span>
          </PermissionLink>
        </div>
      </div>

      <!-- Bottom chevron -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2">
        <p class="text-accents-900 text-2xl flex justify-center align-middle">
          <span class="relative isolate content-center cursor-pointer animate-bounce" on:click={scrollToContent}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-10 h-10">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </p>
      </div>

      <!-- Bottom Blob -->
      <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[var(--from)] to-[var(--to)] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
    </div>

    <!-- Feature section -->
    <div class="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-base font-semibold leading-7 text-main-400">Create faster</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-accents-900 sm:text-4xl">Talk to our app to create your templates</p>
        <p class="mt-6 text-lg leading-8 text-accents-700">Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a elementum pulvinar et feugiat blandit at. In mi viverra elit nunc.</p>
      </div>
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-accents-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-main-400">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              Lorem Ipsum
            </dt>
            <dd class="mt-2 text-base leading-7 text-accents-700">Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.</dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-accents-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-main-400">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              Lorem Ipsum
            </dt>
            <dd class="mt-2 text-base leading-7 text-accents-700">Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.</dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-accents-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-main-400">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              Lorem Ipsum
            </dt>
            <dd class="mt-2 text-base leading-7 text-accents-700">Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.</dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-accents-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-main-400">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                </svg>
              </div>
              Lorem Ipsum
            </dt>
            <dd class="mt-2 text-base leading-7 text-accents-700">Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Testimonial section -->
    <div class="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden bg-accents-900 px-6 py-20 shadow shadow-accents-200-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20">
        <div class="absolute inset-0 h-full w-full object-cover brightness-100 saturate-100">
          <svg viewBox="0 0 1150 647" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(0,68,204);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(0,153,204);stop-opacity:1" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgb(51,204,255);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(0,204,204);stop-opacity:1" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(0,204,255);stop-opacity:0.7" />
                <stop offset="100%" style="stop-color:rgb(0,102,204);stop-opacity:0.7" />
              </linearGradient>
            </defs>
            <rect width="1150" height="647" fill="url(#grad1)" />
            <path d="M0,500 Q200,300 400,450 T800,450 Q1000,600 1150,500 L1150,647 L0,647 Z" fill="url(#grad2)" />
            <path d="M0,450 Q250,250 500,400 T900,400 Q1100,550 1150,450 L1150,647 L0,647 Z" fill="url(#grad3)" />
          </svg>
        </div>
        <!-- <img
          class="absolute inset-0 h-full w-full object-cover brightness-100 saturate-100"
          src="https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?ixid=MXwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8ODl8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1216&q=80"
          alt="" /> -->
        <div class="absolute inset-0 bg-accents-900/90 mix-blend-multiply"></div>
        <div class="absolute -left-80 -top-56 transform-gpu blur-3xl" aria-hidden="true">
          <div class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[var(--from)] to-[var(--to)] opacity-[0.45]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
        </div>
        <div class="hidden md:absolute md:bottom-16 md:left-[50rem] md:block md:transform-gpu md:blur-3xl" aria-hidden="true">
          <div class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[var(--from)] to-[var(--to)] opacity-25" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
        </div>
        <div class="relative mx-auto max-w-2xl lg:mx-0">
          <img class="h-12 w-auto" src="https://tailwindui.com/img/logos/workcation-logo-white.svg" alt="" />
          <figure>
            <blockquote class="mt-6 text-lg font-semibold text-white sm:text-xl sm:leading-8">
              <p>“Amet amet eget scelerisque tellus sit neque faucibus non eleifend. Integer eu praesent at a. Ornare arcu gravida natoque erat et cursus tortor consequat at. Vulputate gravida sociis enim nullam ultricies habitant malesuada lorem ac.”</p>
            </blockquote>
            <figcaption class="mt-6 text-base text-white">
              <div class="font-semibold">Judith Black</div>
              <div class="mt-1">CEO of Tuple</div>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>

    <!-- Pricing section -->
    <div class="py-24 sm:pt-48">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="text-base font-semibold leading-7 text-main-400">Pricing</h2>
          <p class="mt-2 text-4xl font-bold tracking-tight text-accents-900 sm:text-5xl">Pricing plans for teams of&nbsp;all&nbsp;sizes</p>
        </div>
        <p class="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-accents-700">Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et quasi iusto modi velit ut non voluptas in. Explicabo id ut laborum.</p>
        <div class="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div class="flex flex-col justify-between rounded-3xl bg-accents-50 p-8 ring-1 ring-accents-200 xl:p-10 lg:mt-8 lg:rounded-r-none">
            <div>
              <div class="flex items-center justify-between gap-x-4">
                <h3 id="tier-freelancer" class="text-lg font-semibold leading-8 text-accents-900">Freelancer</h3>
              </div>
              <p class="mt-4 text-sm leading-6 text-accents-700">The essentials to provide your best work for clients.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-accents-900">$24</span>
                <span class="text-sm font-semibold leading-6 text-accents-700">/month</span>
              </p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-accents-700">
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  5 products
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Up to 1,000 subscribers
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Basic analytics
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  48-hour support response time
                </li>
              </ul>
            </div>
            <PermissionLink href="/" aria-describedby="tier-freelancer" class="mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-400 text-main-400 ring-1 ring-inset ring-main-200 hover:ring-main-300">Buy plan</PermissionLink>
          </div>
          <div class="flex flex-col justify-between rounded-3xl bg-accents-50 p-8 ring-1 ring-accents-200 xl:p-10 lg:z-10 lg:rounded-b-none">
            <div>
              <div class="flex items-center justify-between gap-x-4">
                <h3 id="tier-startup" class="text-lg font-semibold leading-8 text-main-400">Startup</h3>
                <p class="rounded-full bg-main-100 px-2.5 py-1 text-xs font-semibold leading-5 text-main-400">Most popular</p>
              </div>
              <p class="mt-4 text-sm leading-6 text-accents-700">A plan that scales with your rapidly growing business.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-accents-900">$32</span>
                <span class="text-sm font-semibold leading-6 text-accents-700">/month</span>
              </p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-accents-700">
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  25 products
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Up to 10,000 subscribers
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  24-hour support response time
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Marketing automations
                </li>
              </ul>
            </div>
            <PermissionLink href="/" aria-describedby="tier-startup" class="mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-400 bg-main-400 text-white shadow shadow-accents-200-sm hover:bg-main-500">Buy plan</PermissionLink>
          </div>
          <div class="flex flex-col justify-between rounded-3xl bg-accents-50 p-8 ring-1 ring-accents-200 xl:p-10 lg:mt-8 lg:rounded-l-none">
            <div>
              <div class="flex items-center justify-between gap-x-4">
                <h3 id="tier-enterprise" class="text-lg font-semibold leading-8 text-accents-900">Enterprise</h3>
              </div>
              <p class="mt-4 text-sm leading-6 text-accents-700">Dedicated support and infrastructure for your company.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-accents-900">$48</span>
                <span class="text-sm font-semibold leading-6 text-accents-700">/month</span>
              </p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-accents-700">
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Unlimited products
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Unlimited subscribers
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  1-hour, dedicated support response time
                </li>
                <li class="flex gap-x-3">
                  <svg class="h-6 w-5 flex-none text-main-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                  </svg>
                  Marketing automations
                </li>
              </ul>
            </div>
            <PermissionLink href="/" aria-describedby="tier-enterprise" class="mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-400 text-main-400 ring-1 ring-inset ring-main-200 hover:ring-main-300">Buy plan</PermissionLink>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQs -->
    <div class="mx-auto max-w-2xl divide-y divide-accents-200 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:pb-32">
      <h2 class="text-2xl font-bold leading-10 tracking-tight text-accents-900">Frequently asked questions</h2>
      <dl class="mt-10 space-y-8 divide-y divide-accents-200">
        <div class="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <dt class="text-base font-semibold leading-7 text-accents-900 lg:col-span-5">What&#039;s the best thing about Switzerland?</dt>
          <dd class="mt-4 lg:col-span-7 lg:mt-0">
            <p class="text-base leading-7 text-accents-700">I don&#039;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.</p>
          </dd>
        </div>

        <!-- More questions... -->
      </dl>
    </div>

    <!-- CTA section -->
    <div class="relative -z-10 mt-32 px-6 lg:px-8">
      <div class="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 transform-gpu justify-center overflow-hidden blur-3xl sm:bottom-0 sm:right-[calc(50%-6rem)] sm:top-auto sm:translate-y-0 sm:transform-gpu sm:justify-end" aria-hidden="true">
        <div class="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[var(--from)] to-[var(--to)] opacity-25" style="clip-path: polygon(73.6% 48.6%, 91.7% 88.5%, 100% 53.9%, 97.4% 18.1%, 92.5% 15.4%, 75.7% 36.3%, 55.3% 52.8%, 46.5% 50.9%, 45% 37.4%, 50.3% 13.1%, 21.3% 36.2%, 0.1% 0.1%, 5.4% 49.1%, 21.4% 36.4%, 58.9% 100%, 73.6% 48.6%)"></div>
      </div>
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-accents-900 sm:text-4xl">Boost your productivity.<br />Start using our app today.</h2>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-accents-700">Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur commodo do ea.</p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <PermissionLink href="/" class="rounded-md bg-main-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow shadow-accents-200-sm hover:bg-main-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-400">Get started</PermissionLink>
          <PermissionLink href="/" class="text-sm font-semibold leading-6 text-accents-900">Learn more <span aria-hidden="true">→</span></PermissionLink>
        </div>
      </div>
      <div class="absolute left-1/2 right-0 top-full -z-10 hidden -translate-y-1/2 transform-gpu overflow-hidden blur-3xl sm:block" aria-hidden="true">
        <div class="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[var(--from)] to-[var(--to)] opacity-30" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <div class="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
    <footer aria-labelledby="footer-heading" class="relative border-t border-accents-200 py-24 sm:mt-56 sm:py-32">
      <h2 id="footer-heading" class="sr-only">Footer</h2>
      <div class="xl:grid xl:grid-cols-3 xl:gap-8">
        <Logo />
        <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
          <div class="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 class="text-sm font-semibold leading-6 text-accents-900">Solutions</h3>
              <ul role="list" class="mt-6 space-y-4">
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Hosting</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Data Services</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Uptime Monitoring</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Enterprise Services</PermissionLink>
                </li>
              </ul>
            </div>
            <div class="mt-10 md:mt-0">
              <h3 class="text-sm font-semibold leading-6 text-accents-900">Support</h3>
              <ul role="list" class="mt-6 space-y-4">
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Pricing</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Documentation</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Guides</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">API Reference</PermissionLink>
                </li>
              </ul>
            </div>
          </div>
          <div class="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 class="text-sm font-semibold leading-6 text-accents-900">Company</h3>
              <ul role="list" class="mt-6 space-y-4">
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">About</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Blog</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Jobs</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Press</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Partners</PermissionLink>
                </li>
              </ul>
            </div>
            <div class="mt-10 md:mt-0">
              <h3 class="text-sm font-semibold leading-6 text-accents-900">Legal</h3>
              <ul role="list" class="mt-6 space-y-4">
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Claim</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Privacy</PermissionLink>
                </li>
                <li>
                  <PermissionLink href="/" class="text-sm leading-6 text-accents-700 hover:text-accents-900">Terms</PermissionLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</div>

<style lang="postcss">
</style>
