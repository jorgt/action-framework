<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmailVerificationPromptController extends Controller
{
  public function __invoke(Request $request)
  {
    try {
      $user = $request->user();

      Log::info('Email verification prompt accessed', [
        'user_id' => $user->id,
        'email' => $user->email,
        'is_verified' => $user->hasVerifiedEmail(),
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      if ($user->hasVerifiedEmail()) {
        Log::info('Already verified user accessing verification prompt', [
          'user_id' => $user->id,
          'email' => $user->email,
          'verified_at' => $user->email_verified_at,
          'tenant_id' => tenant()->id,
        ]);

        return redirect()->route('home')->with('message', 'Your email is already verified.');
      }

      Log::info('Showing verification notice to unverified user', [
        'user_id' => $user->id,
        'email' => $user->email,
        'tenant_id' => tenant()->id,
      ]);

      return Inertia::render('tenant/auth/verify-notice');
    } catch (\Exception $e) {
      Log::error('Failed to show email verification prompt', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $user->id ?? null,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }
}
