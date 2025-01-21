<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\Auth\SendPasswordChangedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
  public function update(Request $request)
  {
    try {
      $start = microtime(true);
      $user = $request->user();

      Log::info('Password update initiated', [
        'user_id' => $user->id,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      $validated = $request->validate([
        'current_password' => ['required', 'current_password'],
        'password' => ['required', 'confirmed', Password::defaults()],
      ]);

      Log::debug('Password validation passed', [
        'user_id' => $user->id,
        'tenant_id' => tenant()->id,
      ]);

      $user->update([
        'password' => Hash::make($validated['password']),
      ]);

      SendPasswordChangedNotification::dispatch($user);

      Log::info('Password updated successfully', [
        'user_id' => $user->id,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      return back()->with('message', 'Password updated successfully');
    } catch (\Exception $e) {
      Log::error('Password update failed', [
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
