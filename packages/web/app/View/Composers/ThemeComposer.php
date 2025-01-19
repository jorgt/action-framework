<?php

namespace App\View\Composers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Auth;

class ThemeComposer
{
  public function compose(View $view)
  {
    $theme = Auth::check() ? Auth::user()->color_scheme : json_decode(request()->cookie('visitor_preferences'), true)['theme'] ?? 'light';

    $view->with('theme', $theme);
  }
}
