<?php

namespace App\Jobs\Auth;

use App\Mail\Auth\PasswordReset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPasswordResetEmail implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected $email;
  protected $token;

  public function __construct($email, $token)
  {
    $this->email = $email;
    $this->token = $token;
    $this->queue = 'surveys'; // Add this if it's not already there
  }

  public function handle()
  {
    Mail::to($this->email)->send(new PasswordReset($this->token, $this->email));
  }
}
