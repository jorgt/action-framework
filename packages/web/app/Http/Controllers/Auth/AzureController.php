<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\{Tenants\Role, User};
use App\Models\AuthProvider;
use App\Models\TenantAuthProvider;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class AzureController extends Controller
{
  private function getAzureConfig(TenantAuthProvider $tenantAuth): \SocialiteProviders\Manager\Config
  {
    try {
      $config = $tenantAuth->config;

      if (!$config || !$config['client_id'] || !$config['client_secret']) {
        Log::error('Invalid Azure configuration', [
          'tenant_id' => tenant()->id,
          'tenant_auth_id' => $tenantAuth->id,
          'has_client_id' => isset($config['client_id']),
          'has_client_secret' => isset($config['client_secret']),
        ]);
        throw new Exception('Invalid Azure configuration');
      }

      Log::debug('Azure config retrieved', [
        'tenant_id' => tenant()->id,
        'tenant_auth_id' => $tenantAuth->id,
        'azure_tenant' => $config['tenant_id'] ?? 'common',
      ]);

      return new \SocialiteProviders\Manager\Config($config['client_id'], $config['client_secret'], route('login.azure.callback'), ['tenant' => $config['tenant_id'] ?? 'common']);
    } catch (Exception $e) {
      Log::error('Failed to get Azure config', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'tenant_id' => tenant()->id,
        'tenant_auth_id' => $tenantAuth->id ?? null,
      ]);
      throw $e;
    }
  }

  public function redirect(): RedirectResponse
  {
    try {
      $start = microtime(true);

      if (Auth::check()) {
        Log::info('Already authenticated user attempting Azure login', [
          'user_id' => Auth::id(),
          'tenant_id' => tenant()->id,
          'ip' => request()->ip(),
        ]);
        return redirect()->route('app');
      }

      $tenant = tenant();

      Log::info('Azure authentication initiated', [
        'tenant_id' => $tenant->id,
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      $azureProvider = AuthProvider::on('central')->where('name', 'azure')->where('is_active', true)->first();

      if (!$azureProvider) {
        Log::error('Azure provider not configured', [
          'tenant_id' => $tenant->id,
        ]);
        throw new Exception('Azure provider not configured.');
      }

      if ($tenant->default_auth_provider_id !== $azureProvider->id) {
        Log::warning('Non-Azure default auth method', [
          'tenant_id' => $tenant->id,
          'default_auth_provider_id' => $tenant->default_auth_provider_id,
          'ip' => request()->ip(),
        ]);
        return redirect()
          ->route('login')
          ->withErrors(['email' => 'Azure is not the default authentication method.']);
      }

      $tenantAuth = TenantAuthProvider::on('central')
        ->where('tenant_id', $tenant->id)
        ->where('auth_provider_id', $azureProvider->id)
        ->where('is_enabled', true)
        ->first();

      if (!$tenantAuth) {
        Log::error('Azure auth not configured for tenant', [
          'tenant_id' => $tenant->id,
          'ip' => request()->ip(),
        ]);
        return redirect()
          ->route('login')
          ->withErrors(['email' => 'Azure authentication not configured for this tenant.']);
      }

      session(['azure_auth_tenant' => $tenant->id]);

      Log::info('Redirecting to Azure login', [
        'tenant_id' => $tenant->id,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'ip' => request()->ip(),
      ]);

      return Socialite::driver('azure')->setConfig($this->getAzureConfig($tenantAuth))->redirect();
    } catch (Exception $e) {
      Log::error('Azure redirect failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'tenant_id' => tenant()->id ?? null,
        'ip' => request()->ip(),
      ]);

      return redirect()
        ->route('login')
        ->withErrors(['email' => $e->getMessage()]);
    }
  }

  public function callback(): RedirectResponse
  {
    try {
      $start = microtime(true);
      $tenantId = session('azure_auth_tenant') ?? tenant()->id;

      Log::info('Azure callback received', [
        'tenant_id' => $tenantId,
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);

      $azureProvider = AuthProvider::on('central')->where('name', 'azure')->where('is_active', true)->firstOrFail();

      $tenantAuth = TenantAuthProvider::on('central')
        ->where('tenant_id', $tenantId)
        ->where('auth_provider_id', $azureProvider->id)
        ->first();

      if (!$tenantAuth) {
        Log::error('Azure auth not configured for callback', [
          'tenant_id' => $tenantId,
          'ip' => request()->ip(),
        ]);
        throw new Exception('Azure authentication not configured.');
      }

      $azureUser = Socialite::driver('azure')->setConfig($this->getAzureConfig($tenantAuth))->user();

      Log::debug('Azure user retrieved', [
        'azure_email' => $azureUser->email,
        'azure_id' => $azureUser->id,
        'tenant_id' => $tenantId,
      ]);

      $user = User::where('email', $azureUser->email)->first();

      if (!$user) {
        Log::warning('No matching user found for Azure login', [
          'azure_email' => $azureUser->email,
          'tenant_id' => $tenantId,
          'ip' => request()->ip(),
        ]);
        throw new Exception('No user found with this email address.');
      }

      Auth::login($user);
      session()->forget('azure_auth_tenant');

      Log::info('Azure authentication successful', [
        'user_id' => $user->id,
        'email' => $user->email,
        'tenant_id' => $tenantId,
        'duration_ms' => (microtime(true) - $start) * 1000,
        'ip' => request()->ip(),
      ]);

      return redirect()->intended(route('app'));
    } catch (Exception $e) {
      Log::error('Azure callback failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'tenant_id' => $tenantId ?? null,
        'ip' => request()->ip(),
      ]);

      session()->forget('azure_auth_tenant');

      return redirect()
        ->route('login')
        ->withErrors(['email' => $e->getMessage()]);
    }
  }
}
