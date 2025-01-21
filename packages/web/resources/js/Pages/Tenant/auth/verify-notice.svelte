<script>
  import { router } from '@inertiajs/svelte';
  import Logo from '@/lib/components/Logo.svelte';
  import PermissionButton from '@/lib/components/PermissionButton.svelte';
  export let flash;

  let status = '';

  function resendEmail() {
    router.post(
      route('verification.send'),
      {},
      {
        preserveScroll: true,
        onSuccess: response => {
          status = response.props?.flash?.message || 'A new verification link has been sent.';
        },
      },
    );
  }
</script>

<div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="flex justify-center">
      <Logo />
    </div>
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-accents-900">Verify Your Email</h2>
    <p class="mt-4 text-center text-sm text-accents-700">Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.</p>
    {#if status || flash?.message}
      <p class="mt-4 text-center text-sm text-green-600">
        {status || flash.message}
      </p>
    {/if}
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <button on:click={resendEmail} disabled={router.processing} class="flex w-full items-center justify-center rounded-md bg-main-600 px-3 py-2 text-sm font-semibold text-white shadow shadow-accents-200-sm hover:bg-main-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-600 disabled:opacity-50">
      {#if router.processing}
        <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Sending...
      {:else}
        Resend Verification Email
      {/if}
    </button>
  </div>
</div>
