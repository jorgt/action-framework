<?php

namespace App\Http\Middleware;
use Illuminate\Support\Facades\Cookie;

use Closure;
use Illuminate\Http\Request;

class ConfigureTenantSession
{
  public function handle(Request $request, Closure $next)
  {
    // $host = $request->getHost();
    // $isSecure = $request->secure();

    // if (in_array($host, config('tenancy.central_domains'))) {
    //   // Central domain handling
    //   config(['session.domain' => '.web.test']);
    //   Cookie::setDefaultPathAndDomain('/', '.web.test', $isSecure, true);
    // } else {
    //   // Tenant domain handling - use the actual host
    //   config(['session.domain' => $host]);
    //   Cookie::setDefaultPathAndDomain('/', $host, $isSecure, true);
    // }

    return $next($request);
  }
}
