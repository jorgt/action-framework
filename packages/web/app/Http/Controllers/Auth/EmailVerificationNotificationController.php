<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
  public function store(Request $request)
  {
    try {
      $start = microtime(true);
      $user = $request->user();

      Log::info('Email verification notification requested', [
        'user_id' => $user->id,
        'email' => $user->email,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      if ($user->hasVerifiedEmail()) {
        Log::info('Email already verified', [
          'user_id' => $user->id,
          'email' => $user->email,
          'verified_at' => $user->email_verified_at,
          'tenant_id' => tenant()->id,
        ]);

        return response()->json([
          'status' => 'already_verified',
          'message' => 'Your email is already verified.',
          'redirect_url' => route('home', false),
        ]);
      }

      $user->sendEmailVerificationNotification();

      Log::info('Verification notification sent', [
        'user_id' => $user->id,
        'email' => $user->email,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'tenant_id' => tenant()->id,
      ]);

      return back()->with('message', 'A new verification link has been sent to your email address.');
    } catch (\Exception $e) {
      Log::error('Failed to send verification notification', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $user->id ?? null,
        'email' => $user->email ?? null,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }
}
