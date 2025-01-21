<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class RegisteredUserController extends Controller
{
  public function create()
  {
    try {
      Log::info('Registration page accessed', [
        'tenant_id' => tenant()->id,
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      return Inertia::render('tenant/auth/register');
    } catch (\Exception $e) {
      Log::error('Failed to show registration page', [
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

      Log::info('User registration initiated', [
        'email' => $request->email,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
        'user_agent' => $request->userAgent(),
      ]);

      $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
      ]);

      $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
      ]);

      auth()->login($user);

      Log::info('User registration successful', [
        'user_id' => $user->id,
        'email' => $user->email,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);

      return redirect()->route('home')->with('message', 'Registration successful.');
    } catch (ValidationException $e) {
      Log::warning('User registration validation failed', [
        'email' => $request->email ?? null,
        'errors' => $e->errors(),
        'tenant_id' => tenant()->id,
        'ip' => $request->ip(),
      ]);
      throw $e;
    } catch (\Exception $e) {
      Log::error('User registration failed', [
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
