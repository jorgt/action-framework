<script>
  import PermissionLink from '@/lib/components/PermissionLink.svelte';
  import { page } from '@inertiajs/svelte';
  export let auth;

  let options = [
    { name: 'Profile', href: '/admin/profile', current: true, permission: 'profile.view' },
    { name: 'Users', href: '/admin/account', current: false, permission: 'admin.account.view' },
    { name: 'Permissions', href: '/admin/roles', current: false, permission: 'admin.roles.view' },
    { name: 'Integrations', href: '/admin/integration', current: false, permission: 'admin.webhooks.view' },
    { name: 'Hook logs', href: '/admin/hook-logs', current: false, permission: 'admin.webhooks.view' },
    { name: 'Contacts', href: '/admin/contacts', current: false, permission: 'admin.webhooks.view' },
    { name: auth.tenant.org_name, href: '/admin/providers', current: false, permission: 'admin.auth.view' },
  ];
  $: {
    options = options.map(option => {
      option.current = $page.url.includes(options.href);
      return option;
    });
  }
  // export let data;
</script>

<main>
  <h1 class="sr-only">Account Settings</h1>

  <header class="border-b border-accents-200 bg-accents-50">
    <!-- Secondary navigation -->
    <nav class="flex overflow-x-auto py-4">
      <ul role="list" class="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-accents-700 sm:px-6 lg:px-8">
        {#each options as { name, href, permission }}
          <li>
            <PermissionLink {permission} {href} class={$page.url.includes(href) ? 'text-main-400' : ''}>{name}</PermissionLink>
          </li>
        {/each}
      </ul>
    </nav>
  </header>
  <slot />
</main>
