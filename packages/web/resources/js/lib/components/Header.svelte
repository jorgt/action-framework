<script>
  import Logo from '@/lib/components/Logo.svelte';
  import { page } from '@inertiajs/svelte';
  import PermissionLink from '@/lib/components/PermissionLink.svelte';
  import { router } from '@inertiajs/svelte';
  import Button from './Button.svelte';
  import { Plus } from 'lucide-svelte';
  const {
    auth: { user, tenant },
  } = $page.props;

  console.log(user);

  const menu = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      permission: 'dashboard.view',
    },
    {
      name: '1. Template Management',
      href: '/templates',
      permission: 'template.view',
    },
    {
      name: '2. Campaign Management',
      href: '/campaigns',
      permission: 'campaign.view',
    },
    {
      name: '3. Analytics',
      href: '/analytics',
      permission: 'analytics.view',
    },
    {
      name: 'Editor',
      href: '/editor',
      permission: 'template.create',
    },
    {
      name: 'Admin',
      href: '/admin',
      permission: 'admin.dashboard.view',
    },
  ];

  const getAvatarUrl = email => `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(email)}`;

  $: current = (() => {
    const pathname = $page.url;
    const matchingRoute = menu.find(m => pathname.startsWith(m.href));
    return matchingRoute ? matchingRoute.href : '/dashboard';
  })();

  let showMenu = false;
  let showMobileMenu = false;

  const checkIds = e => {
    while (e) {
      if (e.id === 'avatar') return true;
      e = e.parentElement;
    }
    return false;
  };

  const toggleMobileMenu = () => {
    showMobileMenu = !showMobileMenu;
  };

  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', permission: 'dashboard.view' },
    { name: 'Profile', href: '/profile', permission: 'profile.view' },
    { name: 'Sign out', href: '/logout' },
  ];
</script>

<svelte:window on:click={e => (showMenu = checkIds(e.target) ? !showMenu : false)} />
<nav class="bg-accents-50 sticky border-b border-accents-200">
  <div class="mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 justify-between">
      <div class="flex">
        <div class="-ml-2 mr-2 flex items-center md:hidden">
          <button type="button" class="relative inline-flex items-center justify-center rounded-md p-2 text-accents-400 hover:bg-accents-100 hover:text-accents-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-main-500" aria-controls="mobile-menu" aria-expanded={showMobileMenu} on:click={toggleMobileMenu}>
            <span class="absolute -inset-0.5"></span>
            <span class="sr-only">Open main menu</span>
            <svg class={showMobileMenu ? 'hidden h-6 w-6' : 'block h-6 w-6'} fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <svg class={showMobileMenu ? 'block h-6 w-6' : 'hidden h-6 w-6'} fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex flex-shrink-0 items-center">
          <Logo />
        </div>
        <div class="pl-4 hidden md:ml-6 md:flex md:space-x-8">
          {#each menu as { name, href, permission }}
            <PermissionLink {permission} {href} class={href === current ? 'inline-flex items-center border-b-2 border-main-500 px-1 pt-1 text-sm font-medium text-accents-900' : 'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-accents-700 hover:border-accents-300 hover:text-accents-800'}>
              {name}
            </PermissionLink>
          {/each}
        </div>
      </div>
      <div class="flex items-center">
        <div class="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center gap-4">
          <Button permission="campaign.create" on:click={() => router.visit(`/campaigns`)} design="Emphasised" icon={Plus}>New Campaign</Button>
          <button type="button" class="relative rounded-full bg-accents-50 p-1 text-accents-400 hover:text-accents-600 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2">
            <span class="absolute -inset-1.5"></span>
            <span class="sr-only">View notifications</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          <div class="relative">
            <div id="avatar">
              <button type="button" class="relative flex rounded-full bg-accents-50 text-sm focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2" id="user-menu-button" aria-expanded={showMenu} aria-haspopup="true">
                <span class="absolute -inset-1.5"></span>
                <span class="sr-only">Open user menu</span>
                <img class="h-8 w-8 rounded-full" src={getAvatarUrl(user.email)} alt={user.email} />
              </button>
            </div>
            {#if showMenu}
              <div class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-accents-50 py-1 shadow shadow-accents-200 ring-1 ring-accents-200 ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
                {#each userMenuItems as { name, href, permission }}
                  <PermissionLink {permission} {href} class="block px-4 py-2 text-sm text-accents-700 hover:bg-accents-100" role="menuitem" tabindex="-1">
                    {name}
                  </PermissionLink>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if showMobileMenu}
    <div class="md:hidden" id="mobile-menu">
      <div class="space-y-1 pb-3 pt-2">
        {#each menu as { name, href, permission }}
          <PermissionLink {permission} {href} class={href === current ? 'block border-l-4 border-main-500 bg-main-50 py-2 pl-3 pr-4 text-base font-medium text-main-700 sm:pl-5 sm:pr-6' : 'block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-accents-600 hover:border-accents-300 hover:bg-accents-50 hover:text-accents-700 sm:pl-5 sm:pr-6'}>
            {name}
          </PermissionLink>
        {/each}
      </div>
      <div class="border-t border-accents-200 pb-3 pt-4">
        <div class="flex items-center px-4 sm:px-6">
          <div class="flex-shrink-0">
            <img class="h-10 w-10 rounded-full" src={getAvatarUrl(user.email)} alt={user.email} />
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-accents-800">{user.name || user.email}</div>
            <div class="text-sm font-medium text-accents-600">{user.email}</div>
          </div>
          <button type="button" class="relative ml-auto flex-shrink-0 rounded-full bg-accents-50 p-1 text-accents-400 hover:text-accents-600 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2">
            <span class="absolute -inset-1.5"></span>
            <span class="sr-only">View notifications</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
        </div>
        <div class="mt-3 space-y-1">
          {#each userMenuItems as { name, href, permission }}
            <PermissionLink {permission} {href} class="block px-4 py-2 text-base font-medium text-accents-600 hover:bg-accents-100 hover:text-accents-800 sm:px-6">
              {name}
            </PermissionLink>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</nav>
