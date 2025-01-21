<script>
  import { router } from '@inertiajs/svelte';
  import Logo from '@/lib/components/Logo.svelte';
  import Input from '@/lib/components/Input.svelte';

  export let azureEnabled = false;

  let form = {
    email: 'admin@example.com',
    password: 'password',
    remember: false,
  };

  let errors = {};

  function submit() {
    router.post('/login', form, {
      onError: e => {
        errors = e;
        form.password = '';
      },
      preserveScroll: true,
    });
  }

  function loginWithAzure() {
    router.get('/login/azure');
  }
</script>

<div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="flex justify-center">
      <Logo />
    </div>
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-accents-900">Sign in to your account</h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    {#if errors}
      <div class="text-red-600 py-3 text-sm">
        {#each Object.entries(errors) as [key, error]}
          <div>{error}</div>
        {/each}
      </div>
    {/if}

    {#if azureEnabled}
      <div class="mb-6">
        <button type="button" on:click={loginWithAzure} class="flex w-full justify-center rounded-md bg-accents-200 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F2F2F]">
          <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <!-- Microsoft logo path -->
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
          </svg>
          Sign in with Microsoft
        </button>
      </div>

      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-accents-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-accents-50 px-2 text-accents-600">Or continue with</span>
        </div>
      </div>
    {/if}

    <form class="space-y-6" on:submit|preventDefault={submit}>
      <div>
        <label for="email" class="block text-sm font-medium leading-6 text-accents-900"> Email address </label>
        <div class="mt-2">
          <!-- <input bind:value={form.email} id="email" placeholder="you@yourdomain.com" type="email" autocomplete="email" required class="block w-full rounded-md border-0 py-1.5 bg-accents-200 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" /> -->
          <Input bind:value={form.email} id="email" placeholder="you@yourdomain.com" type="email" autocomplete="email" required classList="block w-full rounded-md border-0 py-1.5 bg-accents-200 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm font-medium leading-6 text-accents-900"> Password </label>
          <div class="text-sm">
            <a href="/forgot-password" class="font-semibold text-main-400 hover:text-main-500">Forgot password?</a>
          </div>
        </div>
        <div class="mt-2">
          <!-- <input bind:value={form.password} id="password" type="password" autocomplete="current-password" placeholder="****" class="bg-accents-200 block w-full rounded-md border-0 py-1.5 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" /> -->
          <Input bind:value={form.password} id="password" type="password" autocomplete="current-password" placeholder="****" classList="bg-accents-200 block w-full rounded-md border-0 py-1.5 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" />
        </div>
      </div>

      <div class="flex items-center">
        <!-- <input bind:checked={form.remember} id="remember" type="checkbox" class="rounded border-accents-300 text-main-500 focus:ring-main-500" /> -->
        <Input bind:checked={form.remember} id="remember" type="checkbox" classList="rounded border-accents-300 text-main-500 focus:ring-main-500" />
        <label for="remember" class="ml-2 block text-sm text-accents-900"> Remember me </label>
      </div>

      <div>
        <button type="submit" class="flex w-full justify-center rounded-md bg-main-500 px-3 py-1.5 text-sm font-semibold leading-6 text-accents-900 shadow shadow-accents-200-sm hover:bg-main-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-500">Sign in</button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm text-accents-600">
      Not a member?
      <a href="/register" class="font-semibold leading-6 text-main-400 hover:text-main-500">Start a 14 day free trial</a>
    </p>
  </div>
</div>
