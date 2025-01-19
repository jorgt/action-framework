<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\View\Composers\ThemeComposer;

class ViewServiceProvider extends ServiceProvider
{
  public function boot()
  {
    view()->composer('*', ThemeComposer::class);
  }
}
