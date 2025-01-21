<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;

class PasswordResetLinkController extends Controller
{
  public function create()
  {
    try {
      Log::info('Password reset request page accessed', [
        'tenant_id' => tenant()->id,
        'ip' => request()->ip(),
      ]);

      return Inertia::render('tenant/auth/password/request');
    } catch (\Exception $e) {
      Log::error('Failed to show password reset request page', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'tenant_id' => tenant()->id,
        'ip' => request()->ip(),
      ]);
      throw $e;
    }
  }

  public function store(Request $request)
  {
    try {
      $start = microtime(true);

      Log::info('Password reset link requested', [
        'email' => $request->email,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      $request->validate(['email' => 'required|email']);

      $status = Password::sendResetLink($request->only('email'));

      if ($status == Password::RESET_LINK_SENT) {
        Log::info('Password reset link sent successfully', [
          'email' => $request->email,
          'status' => $status,
          'duration_ms' => (microtime(true) - $start) * 1000,
          'tenant_id' => tenant()->id,
        ]);

        return back()->with('message', __($status));
      }

      Log::warning('Password reset link not sent', [
        'email' => $request->email,
        'status' => $status,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      return back()->withErrors(['email' => __($status)]);
    } catch (\Exception $e) {
      Log::error('Failed to process password reset link request', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'email' => $request->email ?? null,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }
}
