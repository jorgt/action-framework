<?php

namespace App\Jobs\Auth;

use App\Mail\Auth\Welcome;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected $user;

  public function __construct($user)
  {
    $this->user = $user;
    $this->queue = 'surveys'; // Add this if it's not already there
  }

  public function handle()
  {
    Mail::to($this->user->email)->send(new Welcome($this->user));
  }
}
