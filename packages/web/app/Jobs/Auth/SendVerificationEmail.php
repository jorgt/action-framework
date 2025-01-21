<?php

namespace App\Jobs\Auth;

use App\Mail\Auth\EmailVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class SendVerificationEmail implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected $user;
  protected $tenantDomain;

  public function __construct($user)
  {
    $this->user = $user;
    $this->tenantDomain = tenant()->domain;
    $this->queue = 'surveys';
  }

  public function handle()
  {
    URL::forceRootUrl($this->tenantDomain);
    Mail::to($this->user->email)->send(new EmailVerification($this->user));
    URL::forceRootUrl(null);
  }
}
