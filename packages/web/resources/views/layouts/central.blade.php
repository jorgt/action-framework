<!DOCTYPE html>
<html lang="en" data-theme="{{ $theme }}" data-tenant="{{ tenancy()->tenant->id ?? '' }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Survely</title>
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="robots" content="{{ app()->environment('staging') ? 'noindex, nofollow' : 'index,follow' }}" />
    @vite(['resources/css/app.css', 'resources/js/tenant-inertia.js', 'resources/js/darkmode.js'])
    @inertiaHead
    @routes

    {!! tenancy()->tenant->css ?? '' !!}
  </head>

  <body class="font-sans antialiased">
    @inertia
  </body>
</html>
