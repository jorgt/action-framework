<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Api\WebhookRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
  /**
   * Get all webhooks
   */
  public function index(): JsonResponse
  {
    try {
      $webhooks = DB::table('action_webhooks')
        ->select('*')
        ->get();

      return response()->json($webhooks);
    } catch (\Exception $e) {
      Log::error('Error fetching webhooks', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'status' => 'error',
        'message' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Get a specific webhook
   */
  public function show(string $id): JsonResponse
  {
    try {
      $webhook = DB::table('action_webhooks')
        ->where('id', $id)
        ->first();

      if (!$webhook) {
        return response()->json([
          'status' => 'error',
          'message' => 'Webhook not found'
        ], 404);
      }

      return response()->json($webhook);
    } catch (\Exception $e) {
      Log::error('Error fetching webhook', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'status' => 'error',
        'message' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Create a new webhook
   */
  public function store(WebhookRequest $request): JsonResponse
  {
    try {
      $webhook = DB::table('action_webhooks')->insertGetId([
        'headers' => json_encode($request->headers),
        'parameters' => json_encode($request->parameters),
        'url' => $request->url,
        'method' => $request->method,
        'fields' => json_encode($request->fields),
        'name' => $request->name,
        'created_at' => now(),
        'updated_at' => now()
      ]);

      $newWebhook = DB::table('action_webhooks')
        ->where('id', $webhook)
        ->first();

      return response()->json($newWebhook);
    } catch (\Exception $e) {
      Log::error('Error creating webhook', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'status' => 'error',
        'message' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Update an existing webhook
   */
  public function update(WebhookRequest $request, string $id): JsonResponse
  {
    try {
      $updated = DB::table('action_webhooks')
        ->where('id', $id)
        ->update([
          'headers' => json_encode($request->headers),
          'parameters' => json_encode($request->parameters),
          'url' => $request->url,
          'method' => $request->method,
          'fields' => json_encode($request->fields),
          'name' => $request->name,
          'updated_at' => now()
        ]);

      if (!$updated) {
        return response()->json([
          'status' => 'error',
          'message' => 'Webhook not found'
        ], 404);
      }

      $webhook = DB::table('action_webhooks')
        ->where('id', $id)
        ->first();

      return response()->json($webhook);
    } catch (\Exception $e) {
      Log::error('Error updating webhook', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'status' => 'error',
        'message' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Delete a webhook
   */
  public function destroy(string $id): JsonResponse
  {
    try {
      $deleted = DB::table('action_webhooks')
        ->where('id', $id)
        ->delete();

      if (!$deleted) {
        return response()->json([
          'status' => 'error',
          'message' => 'Webhook not found'
        ], 404);
      }

      return response()->json([
        'status' => 'success',
        'message' => 'Webhook deleted'
      ]);
    } catch (\Exception $e) {
      Log::error('Error deleting webhook', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'status' => 'error',
        'message' => 'Internal Server Error'
      ], 500);
    }
  }
}
