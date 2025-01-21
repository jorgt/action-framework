<?php

use App\Http\Controllers\Central\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Tenant\DashboardController;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Tenant\Api\EntityController;
// Universal routes (error handling, fallback, etc.)
Route::middleware(['universal'])->group(function () {
  require base_path('routes/universal.php');
});

// Central routes
foreach (config('tenancy.central_domains') as $domain) {
  Route::domain($domain)->group(function () {
    Route::get('/', [HomeController::class, 'index']);
  });
}

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
  'web',
  InitializeTenancyByDomain::class,
  PreventAccessFromCentralDomains::class,
])->group(function () {

  // Authentication routes
  Route::group([], function () {
    require base_path('routes/tenant/auth.php');
  });

  Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('home');
    Route::post('/api/entity/{id}/sequence', [EntityController::class, 'executeSequence']);
    // require base_path('routes/tenant/api.php');
  });
});

// API Routes
// Route::middleware([
//   InitializeTenancyByDomain::class,
//   PreventAccessFromCentralDomains::class,
// ])->group(base_path('routes/tenant/api.php'));
