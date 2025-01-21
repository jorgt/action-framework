<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use App\Models\User;
use App\Jobs\Auth\SendPasswordResetSuccessNotification;

class NewPasswordController extends Controller
{
  public function create(Request $request)
  {
    try {
      Log::info('Password reset page accessed', [
        'has_token' => !empty($request->token),
        'has_email' => !empty($request->email),
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      return Inertia::render('tenant/auth/reset-password', [
        'token' => $request->token,
        'email' => $request->email,
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to show password reset page', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }

  public function store(Request $request)
  {
    try {
      $start = microtime(true);

      Log::info('Password reset attempt initiated', [
        'email' => $request->email,
        'has_token' => !empty($request->token),
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      $request->validate([
        'token' => ['required'],
        'email' => ['required', 'email'],
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
      ]);

      $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function ($user) use ($request, $start) {
        Log::info('Resetting user password', [
          'user_id' => $user->id,
          'email' => $user->email,
          'tenant_id' => tenant()->id,
        ]);

        $user
          ->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
          ])
          ->save();

        event(new PasswordReset($user));
        SendPasswordResetSuccessNotification::dispatch($user);

        Log::info('Password reset successful', [
          'user_id' => $user->id,
          'email' => $user->email,
          'duration_ms' => (microtime(true) - $start) * 1000,
          'tenant_id' => tenant()->id,
        ]);
      });

      if ($status == Password::PASSWORD_RESET) {
        Log::info('Password reset completed', [
          'email' => $request->email,
          'status' => $status,
          'duration_ms' => (microtime(true) - $start) * 1000,
          'tenant_id' => tenant()->id,
        ]);

        return redirect()->route('login')->with('message', __($status));
      }

      Log::warning('Password reset failed', [
        'email' => $request->email,
        'status' => $status,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      return back()->withErrors(['email' => __($status)]);
    } catch (\Exception $e) {
      Log::error('Password reset process failed', [
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
