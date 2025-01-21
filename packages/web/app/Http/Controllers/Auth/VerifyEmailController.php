<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Log;
use App\Jobs\Auth\SendWelcomeEmail;

class VerifyEmailController extends Controller
{
  public function __invoke(EmailVerificationRequest $request)
  {
    try {
      $start = microtime(true);
      $user = $request->user();
      $tenant = tenant();

      Log::info('Email verification attempt', [
        'user_id' => $user->id,
        'email' => $user->email,
        'tenant_id' => $tenant->id,
        'ip' => $request->ip(),
      ]);

      // Temporarily set app URL to current tenant domain for signature verification
      $originalUrl = config('app.url');
      $tenantDomain = $tenant->domains()->first()->domain;
      config(['app.url' => 'http://' . $tenantDomain]);

      Log::debug('Verifying with tenant domain', [
        'original_url' => $originalUrl,
        'tenant_domain' => $tenantDomain,
        'tenant_id' => $tenant->id,
      ]);

      try {
        if ($user->hasVerifiedEmail()) {
          Log::info('Email already verified', [
            'user_id' => $user->id,
            'email' => $user->email,
            'verified_at' => $user->email_verified_at,
            'tenant_id' => $tenant->id,
          ]);

          return redirect()->route('home')->with('message', 'Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
          event(new Verified($user));
          SendWelcomeEmail::dispatch($user);

          Log::info('Email verified successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'duration_ms' => (microtime(true) - $start) * 1000,
            'tenant_id' => $tenant->id,
            'ip' => $request->ip(),
          ]);
        }

        return redirect()->route('home')->with('message', 'Email verified successfully.');
      } finally {
        // Restore original URL
        config(['app.url' => $originalUrl]);

        Log::debug('Restored original app URL', [
          'url' => $originalUrl,
          'tenant_id' => $tenant->id,
        ]);
      }
    } catch (\Exception $e) {
      Log::error('Email verification failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $user->id ?? null,
        'email' => $user->email ?? null,
        'tenant_id' => $tenant->id ?? null,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }
}
