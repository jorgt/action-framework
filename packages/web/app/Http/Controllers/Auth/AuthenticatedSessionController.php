<?php

namespace App\Http\Controllers\Auth;

// use App\Models\{AuthProvider, TenantAuthProvider, User};
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
// use Laravel\Socialite\Facades\Socialite;

class AuthenticatedSessionController extends Controller
{
  public function create(): Response|RedirectResponse|SymfonyResponse
  {
    // if (request()->has('code') || request()->has('state')) {
    //   Log::info('OAuth redirect detected', [
    //     'provider' => 'azure',
    //     'ip' => request()->ip(),
    //     'tenant_id' => tenant()->id,
    //   ]);
    //   return redirect()->route('login.azure.callback');
    // }

    // $tenant = tenant();
    // $azureProvider = AuthProvider::on('central')->where('name', 'azure')->first();
    // $tenantAuth = null;

    // if ($azureProvider) {
    //   $tenantAuth = TenantAuthProvider::on('central')
    //     ->where('tenant_id', $tenant->id)
    //     ->where('auth_provider_id', $azureProvider->id)
    //     ->where('is_enabled', true)
    //     ->first();
    // }

    // if ($tenantAuth && $tenant->default_auth_provider_id === $azureProvider?->id) {
    //   Log::info('Azure SSO redirect', [
    //     'tenant_id' => $tenant->id,
    //     'ip' => request()->ip(),
    //     'user_agent' => request()->userAgent(),
    //   ]);
    //   return Inertia::location(route('login.azure'));
    // }

    // session()->forget('azure_auth_attempt');

    // Log::debug('Login page accessed', [
    //   'tenant_id' => $tenant->id,
    //   'azure_enabled' => $tenantAuth?->is_enabled ?? false,
    //   'ip' => request()->ip(),
    // ]);

    return Inertia::render('tenant/auth/login', [
      // 'azureEnabled' => $tenantAuth?->is_enabled ?? false,
    ]);
  }

  // public function checkSession(Request $request)
  // {
  //   try {
  //     $tenant = tenant();
  //     $azureProvider = AuthProvider::on('central')->where('name', 'azure')->where('is_active', true)->first();

  //     if (!$azureProvider || $tenant->default_auth_provider_id !== $azureProvider->id) {
  //       return response()->json(['authType' => 'standard', 'sessionNearingExpiry' => false]);
  //     }

  //     $tenantAuth = TenantAuthProvider::on('central')
  //       ->where('tenant_id', $tenant->id)
  //       ->where('auth_provider_id', $azureProvider->id)
  //       ->where('is_enabled', true)
  //       ->first();

  //     if (!$tenantAuth) {
  //       return response()->json(['authType' => 'standard', 'sessionNearingExpiry' => false]);
  //     }

  //     if (!Auth::check()) {
  //       Log::info('Session expired or invalid', [
  //         'tenant_id' => $tenant->id,
  //         'ip' => $request->ip(),
  //         'user_agent' => $request->userAgent(),
  //       ]);
  //       return response()->json(['authType' => 'azure', 'sessionNearingExpiry' => true]);
  //     }

  //     $sessionTimeLeft = session()->has('_token_expires_at') ? now()->diffInMinutes(session()->get('_token_expires_at')) : 0;

  //     if ($sessionTimeLeft <= 10) {
  //       Log::info('Session nearing expiry', [
  //         'tenant_id' => $tenant->id,
  //         'user_id' => Auth::id(),
  //         'minutes_left' => $sessionTimeLeft,
  //         'ip' => $request->ip(),
  //       ]);
  //     }

  //     return response()->json([
  //       'authType' => 'azure',
  //       'sessionNearingExpiry' => $sessionTimeLeft <= 10,
  //     ]);
  //   } catch (\Exception $e) {
  //     Log::error('Session check failed', [
  //       'error' => $e->getMessage(),
  //       'trace' => $e->getTraceAsString(),
  //       'tenant_id' => tenant()->id,
  //       'ip' => $request->ip(),
  //       'user_id' => Auth::id(),
  //     ]);
  //     return response()->json(['error' => 'Session check failed'], 500);
  //   }
  // }

  // public function refreshSession(Request $request)
  // {
  //   try {
  //     if (!Auth::check()) {
  //       Log::warning('Unauthenticated session refresh attempt', [
  //         'ip' => $request->ip(),
  //         'tenant_id' => tenant()->id,
  //       ]);
  //       return response()->json(['error' => 'Not authenticated'], 401);
  //     }

  //     $tenant = tenant();
  //     $azureProvider = AuthProvider::on('central')->where('name', 'azure')->firstOrFail();

  //     $tenantAuth = TenantAuthProvider::on('central')
  //       ->where('tenant_id', $tenant->id)
  //       ->where('auth_provider_id', $azureProvider->id)
  //       ->firstOrFail();

  //     session()->put('_token_expires_at', now()->addMinutes((int) config('session.lifetime')));

  //     Log::info('Session refreshed', [
  //       'user_id' => Auth::id(),
  //       'tenant_id' => $tenant->id,
  //       'ip' => $request->ip(),
  //       'new_expiry' => session()->get('_token_expires_at'),
  //     ]);

  //     return response()->json(['status' => 'success']);
  //   } catch (\Exception $e) {
  //     Log::error('Session refresh failed', [
  //       'error' => $e->getMessage(),
  //       'trace' => $e->getTraceAsString(),
  //       'tenant_id' => tenant()->id,
  //       'user_id' => Auth::id(),
  //       'ip' => $request->ip(),
  //     ]);
  //     return response()->json(['error' => 'Session refresh failed'], 500);
  //   }
  // }

  public function store(LoginRequest $request)
  {
    try {
      Log::info('Authentication attempt', [
        'email' => $request->email,
        'ip' => $request->ip(),
        'tenant_id' => tenant()->id,
        'user_agent' => $request->userAgent(),
      ]);

      $request->authenticate();
      $request->session()->regenerate();

      Log::info('Authentication successful', [
        'user_id' => Auth::id(),
        'email' => $request->email,
        'ip' => $request->ip(),
        'tenant_id' => tenant()->id,
      ]);

      return redirect()->intended(route('home'));
    } catch (\Exception $e) {
      Log::warning('Authentication failed', [
        'email' => $request->email,
        'ip' => $request->ip(),
        'tenant_id' => tenant()->id,
        'error' => $e->getMessage(),
      ]);
      throw $e;
    }
  }

  public function destroy(Request $request)
  {
    $userId = Auth::id();
    $tenantId = tenant()->id;

    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    Log::info('User logged out', [
      'user_id' => $userId,
      'tenant_id' => $tenantId,
      'ip' => $request->ip(),
    ]);

    return redirect()->route('home');
  }
}
