<script>
  import { onMount } from 'svelte';
  import { router } from '@inertiajs/svelte';
  import Logo from '@/lib/components/Logo.svelte';
  import PermissionButton from '@/lib/components/PermissionButton.svelte';
  export let id;
  export let hash;

  let message = 'Please wait while we verify your email address...';
  let status = 'verifying';
  let verifying = true;

  onMount(() => {
    router.get(
      route('verification.verify', { id, hash }),
      {},
      {
        preserveScroll: true,
        onStart: () => {
          verifying = true;
        },
        onSuccess: response => {
          status = 'success';
          message = response.props?.flash?.message || 'Email verified successfully!';
          verifying = false;
        },
        onError: () => {
          status = 'error';
          message = 'There was an error verifying your email. Please try again.';
          verifying = false;
        },
      },
    );
  });

  function goHome() {
    router.visit(route('home'), { preserveScroll: true });
  }
</script>

<div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="flex justify-center">
      <Logo />
    </div>
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-accents-900">Email Verification</h2>
    <p class="mt-4 text-center text-sm" class:text-accents-700={verifying} class:text-green-600={status === 'success'} class:text-red-600={status === 'error'}>
      {message}
    </p>
    {#if status === 'success' && !verifying}
      <div class="mt-6 flex justify-center">
        <PermissionButton permission="dashboard.view" class="inline-flex items-center rounded-md bg-main-600 px-4 py-2 text-sm font-semibold text-white hover:bg-main-500 disabled:opacity-50" on:click={goHome} disabled={router.processing}>
          {#if router.processing}
            <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          {:else}
            Continue to Dashboard
          {/if}
        </PermissionButton>
      </div>
    {/if}
  </div>
</div>
