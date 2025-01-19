<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\DatabaseManager;

class CreateDatabaseExtensions implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected $tenant;

  public function __construct(TenantWithDatabase $tenant)
  {
    $this->tenant = $tenant;
  }

  public function handle()
  {
    $extensions = [
      'timescaledb',
      'vector',
      '"uuid-ossp"'
    ];

    $this->tenant->run(function () use ($extensions) {
      foreach ($extensions as $extension) {
        DB::statement("CREATE EXTENSION IF NOT EXISTS {$extension};");
      }
    });
  }
}
