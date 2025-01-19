<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QueueController extends Controller
{
  /**
   * Execute a sequence by adding it to the Bull MQ queue
   */
  public function executeSequence(Request $request): JsonResponse
  {
    $request->validate([
      'entityId' => 'required|uuid',
      'entityType' => 'required|string',
      'sequenceId' => 'required|uuid'
    ]);

    try {
      // Get sequence details from database
      $sequence = DB::selectOne("
        SELECT s.*, m.id as matrix_id, m.code as matrix_code
        FROM action_sequences s
        JOIN action_matrix_sequences ms ON ms.sequence_id = s.id
        JOIN action_matrixes m ON m.id = ms.action_matrix_id
        JOIN action_entity_matrix em ON em.action_matrix_id = m.id
        WHERE s.id = ?
        AND em.entity_type = ?
        AND ms.status_id = (
          SELECT id FROM action_statuses WHERE code = (
            SELECT status_code FROM action_entity_status WHERE entity_id = ? AND entity_type = ?
          )
        )
      ", [
        $request->sequenceId,
        $request->entityType,
        $request->entityId,
        $request->entityType
      ]);

      if (!$sequence) {
        return response()->json([
          'success' => false,
          'error' => 'Invalid sequence for current entity state'
        ], 400);
      }

      // Add job to Bull MQ queue
      $jobId = uniqid('job_');
      Redis::connection()->zadd(
        'bull:action-queue:waiting',
        microtime(true) * 1000,
        json_encode([
          'id' => $jobId,
          'name' => 'execute-action',
          'data' => [
            'entityId' => $request->entityId,
            'entityType' => $request->entityType,
            'sequenceId' => $request->sequenceId,
            'actionData' => [
              'sequence_code' => $sequence->code,
              'matrix_code' => $sequence->matrix_code
            ]
          ],
          'opts' => [
            'attempts' => 3,
            'backoff' => [
              'type' => 'exponential',
              'delay' => 1000
            ],
            'removeOnComplete' => false,
            'removeOnFail' => false
          ]
        ])
      );

      return response()->json([
        'success' => true,
        'data' => [
          'jobId' => $jobId,
          'message' => 'Sequence execution queued'
        ]
      ]);
    } catch (\Exception $e) {
      Log::error('Error executing sequence', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Get job status from Bull MQ
   */
  public function getJobStatus(string $jobId): JsonResponse
  {
    try {
      $redis = Redis::connection();

      // Check different job states
      $states = ['completed', 'failed', 'active', 'waiting', 'delayed'];
      $status = null;

      foreach ($states as $state) {
        $jobs = $redis->zrange("bull:action-queue:$state", 0, -1);
        foreach ($jobs as $job) {
          $jobData = json_decode($job, true);
          if ($jobData['id'] === $jobId) {
            $status = [
              'state' => $state,
              'data' => $jobData
            ];
            break 2;
          }
        }
      }

      if (!$status) {
        return response()->json([
          'success' => false,
          'error' => 'Job not found'
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => $status
      ]);
    } catch (\Exception $e) {
      Log::error('Error getting job status', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }

  /**
   * Get available sequences from database
   */
  public function getAvailableSequences(string $entityType, string $entityId): JsonResponse
  {
    try {
      $sequences = DB::select("
        SELECT 
          s.id as sequence_id,
          s.code as sequence_code,
          s.description as sequence_description,
          ss.code as status_on_sequence_success_code,
          fs.code as status_on_sequence_failure_code
        FROM action_sequences s
        JOIN action_matrix_sequences ms ON ms.sequence_id = s.id
        JOIN action_entity_matrix em ON em.action_matrix_id = ms.action_matrix_id
        JOIN action_entity_status es ON es.entity_id = ? AND es.entity_type = ?
        JOIN action_statuses ss ON s.status_on_sequence_success = ss.id
        JOIN action_statuses fs ON s.status_on_sequence_failure = fs.id
        WHERE em.entity_type = es.entity_type
        AND ms.status_id = (SELECT id FROM action_statuses WHERE code = es.status_code)
      ", [$entityId, $entityType]);

      return response()->json([
        'success' => true,
        'data' => $sequences
      ]);
    } catch (\Exception $e) {
      Log::error('Error getting available sequences', [
        'error' => $e->getMessage()
      ]);
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }
}
