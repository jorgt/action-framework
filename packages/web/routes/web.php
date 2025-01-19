<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Central\HomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

// require __DIR__.'/auth.php';
