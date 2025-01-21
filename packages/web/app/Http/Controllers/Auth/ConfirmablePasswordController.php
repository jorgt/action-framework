<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ConfirmablePasswordController extends Controller
{
  public function show()
  {
    try {
      Log::info('Password confirmation page accessed', [
        'user_id' => auth()->id(),
        'tenant_id' => tenant()->id,
        'ip' => request()->ip(),
      ]);

      return Inertia::render('tenant/auth/confirm-password');
    } catch (\Exception $e) {
      Log::error('Failed to show password confirmation page', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => auth()->id(),
        'tenant_id' => tenant()->id,
      ]);
      throw $e;
    }
  }

  public function store(Request $request)
  {
    try {
      $start = microtime(true);

      Log::info('Password confirmation attempt', [
        'user_id' => $request->user()->id,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      $request->validate(['password' => 'required|string']);

      if (!Hash::check($request->password, $request->user()->password)) {
        Log::warning('Invalid password confirmation attempt', [
          'user_id' => $request->user()->id,
          'tenant_id' => tenant()->id,
          'ip' => $request->ip(),
        ]);

        return response()->json(
          [
            'errors' => ['password' => __('The provided password does not match our records.')],
          ],
          422,
        );
      }

      $request->session()->passwordConfirmed();

      Log::info('Password successfully confirmed', [
        'user_id' => $request->user()->id,
        'tenant_id' => tenant()->id,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'ip' => $request->ip(),
      ]);

      return redirect()->intended();
    } catch (\Exception $e) {
      Log::error('Password confirmation failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'user_id' => $request->user()->id ?? null,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    }
  }
}
