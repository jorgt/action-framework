<script>
  import { router } from '@inertiajs/svelte';
  import Logo from '@/lib/components/Logo.svelte';
  import Input from '@/lib/components/Input.svelte';

  let form = {
    email: '',
  };

  let errors = {};

  function submit() {
    router.post('/forgot-password', form, {
      onError: errors => {
        // Handle error scenario
      },
      preserveScroll: true,
    });
  }
</script>

<div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="flex justify-center">
      <Logo />
    </div>
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-accents-900">Forgot your password?</h2>
    <p class="mt-4 text-center text-sm text-accents-700">No problem. Just let us know your email address and we will email you a password reset link.</p>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    {#if errors}
      <div class="text-red-600 py-3 text-sm">
        {#each Object.entries(errors) as [key, error]}
          <div>{error}</div>
        {/each}
      </div>
    {/if}

    <form class="space-y-6" on:submit|preventDefault={submit}>
      <div>
        <label for="email" class="block text-sm font-medium leading-6 text-accents-900"> Email address </label>
        <div class="mt-2">
          <!-- <input bind:value={form.email} id="email" type="email" required class="block w-full rounded-md border-0 py-1.5 bg-accents-200 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" /> -->
          <Input bind:value={form.email} id="email" type="email" required classList="block w-full rounded-md border-0 py-1.5 bg-accents-200 text-accents-900 shadow shadow-accents-200-sm ring-1 ring-inset ring-accents-300 placeholder:text-accents-400 focus:ring-2 focus:ring-inset focus:ring-main-500 sm:text-sm sm:leading-6" />
        </div>
      </div>

      <div>
        <button type="submit" class="flex w-full justify-center rounded-md bg-main-600 px-3 py-2 text-sm font-semibold text-white shadow shadow-accents-200-sm hover:bg-main-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600">Send Reset Link</button>
      </div>
    </form>
  </div>
</div>
