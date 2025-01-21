<!DOCTYPE html>
<html lang="en" data-theme="{{ $theme }}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Survely</title>
  <meta name="csrf-token" content="{{ csrf_token() }}" />
  <meta name="robots" content="{{ app()->environment('staging') ? 'noindex, nofollow' : 'index,follow' }}" />
  @vite(entrypoints: ['resources/js/app.js', 'resources/css/app.css', 'resources/js/inertia.js', 'resources/js/darkmode.js'])
  @inertiaHead
  @routes

  {{-- {!! tenancy()->tenant->css ?? '' !!} --}}
</head>

<body class="font-sans antialiased">
  @inertia
</body>

</html>