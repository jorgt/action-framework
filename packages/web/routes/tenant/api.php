<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Tenant\Api\EntityController;
use App\Http\Controllers\Tenant\Api\QueueController;
use App\Http\Controllers\Tenant\Api\LogController;
use App\Http\Controllers\Tenant\Api\WebhookController;

Route::prefix('api')->group(function () {
  // Entity routes
  Route::get('/entity/{id}', [EntityController::class, 'show']);
  Route::get('/entities', [EntityController::class, 'index']);
  Route::post('/entity/{id}/sequence', [EntityController::class, 'executeSequence']);

  // Queue routes
  Route::post('/queue/execute', [QueueController::class, 'executeSequence']);
  Route::get('/queue/status/{jobId}', [QueueController::class, 'getJobStatus']);
  Route::get('/queue/sequences/{entityType}/{entityId}', [QueueController::class, 'getAvailableSequences']);

  // Log routes
  Route::get('/logs', [LogController::class, 'index']);

  // Webhook routes
  Route::apiResource('webhooks', WebhookController::class);
});
