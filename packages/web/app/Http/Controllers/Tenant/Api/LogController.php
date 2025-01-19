<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LogController extends Controller
{
  /**
   * Get action logs with related data
   */
  public function index(): JsonResponse
  {
    try {
      $logs = DB::select("
        SELECT 
          l.id,
          l.action_id,
          l.created_at,
          a.description as action_description,
          a.code as action_code,
          e.name as entity_name,
          l.payload,
          l.result
        FROM action_log l
        INNER JOIN action_actions a ON l.action_id = a.id
        INNER JOIN entities e ON l.entity_id = e.id
        ORDER BY l.created_at DESC
        LIMIT 100
      ");

      return response()->json([
        'success' => true,
        'data' => $logs
      ]);
    } catch (\Exception $e) {
      Log::error('Error fetching action logs', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }
}
