<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntityController extends Controller
{
  /**
   * Get a specific entity by ID with its current status and available sequences
   */
  public function show(string $id): JsonResponse
  {
    $entity = DB::select("
      WITH entity_sequences AS (
        SELECT 
          es.entity_id,
          json_agg(
            json_build_object(
              'sequence_id', s.id,
              'sequence_code', s.code,
              'sequence_description', s.description,
              'status_on_sequence_success_code', ss.code,
              'status_on_sequence_failure_code', fs.code
            )
          ) as sequences
        FROM action_entity_status es
        JOIN action_entity_matrix em ON em.entity_type = es.entity_type
        JOIN action_matrix_sequences ms ON ms.action_matrix_id = em.action_matrix_id
        JOIN action_sequences s ON s.id = ms.sequence_id
        JOIN action_statuses ss ON s.status_on_sequence_success = ss.id
        JOIN action_statuses fs ON s.status_on_sequence_failure = fs.id
        WHERE ms.status_id = es.action_id
        GROUP BY es.entity_id
      )
      SELECT 
        e.id,
        e.name,
        e.created_at,
        e.updated_at,
        es.action_id,
        es.entity_type,
        s.code as status_code,
        s.description as status_description,
        COALESCE(seq.sequences, '[]'::json) as sequences
      FROM entities e
      JOIN action_entity_status es ON es.entity_id = e.id
      JOIN action_statuses s ON s.id = es.action_id
      LEFT JOIN entity_sequences seq ON seq.entity_id = e.id
      WHERE e.id = ?
    ", [$id]);

    if (empty($entity)) {
      return response()->json([
        'success' => false,
        'error' => 'Entity not found'
      ], 404);
    }

    $entity = $entity[0];
    $entity->sequences = json_decode($entity->sequences);

    return response()->json([
      'success' => true,
      'data' => $entity
    ]);
  }

  /**
   * Get all entities with their current status
   */
  public function index(): JsonResponse
  {
    $entities = DB::select("
      SELECT 
        e.id,
        e.name,
        e.created_at,
        e.updated_at,
        es.status_code,
        es.entity_type,
        COALESCE(
          (SELECT true FROM action_log WHERE entity_id = e.id AND result->>'status' = 'IN PROCESS' LIMIT 1),
          false
        ) as locked,
        s.description as status_description,
        COALESCE(
          json_agg(
            json_build_object(
              'sequence_id', aseq.sequence_id,
              'sequence_code', aseq.sequence_code,
              'sequence_description', aseq.sequence_description,
              'status_on_sequence_success_code', aseq.status_on_sequence_success_code,
              'status_on_sequence_failure_code', aseq.status_on_sequence_failure_code
            )
          ) FILTER (WHERE aseq.sequence_id IS NOT NULL),
          '[]'::json
        ) as sequences
      FROM entities e
      JOIN action_entity_status es ON es.entity_id = e.id
      JOIN action_statuses s ON s.code = es.status_code
      LEFT JOIN action_available_sequences aseq ON aseq.entity_id = e.id
      GROUP BY e.id, e.name, e.created_at, e.updated_at, es.status_code, es.entity_type, s.description
      ORDER BY e.created_at DESC
    ");

    return response()->json([
      'success' => true,
      'data' => $entities
    ]);
  }

  // /**
  //  * Execute a sequence on an entity
  //  */
  // public function executeSequence(Request $request, string $id)
  // {
  //   $request->validate([
  //     'sequence_code' => 'required|string|size:4'
  //   ]);

  //   try {
  //     $entity = DB::selectOne("
  //           SELECT e.*, es.entity_type, es.action_id
  //           FROM entities e
  //           JOIN action_entity_status es ON es.entity_id = e.id
  //           WHERE e.id = ?
  //       ", [$id]);

  //     \Log::info('Entity: ' . json_encode($entity));

  //     if (!$entity) {
  //       return back()->with('error', 'Entity not found');
  //     }

  //     \Log::info('Entity: ' . json_encode($entity));

  //     // Call the actions API to enqueue the job
  //     $client = new \GuzzleHttp\Client();
  //     try {
  //       $response = $client->post(env('ACTIONS_API_URL') . '/enqueue', [
  //         'headers' => [
  //           'Content-Type' => 'application/json',
  //           'x-api-key' => env('ACTIONS_API_KEY')
  //         ],
  //         'json' => [
  //           'entity_id' => $id,
  //           'entity_type' => $entity->entity_type,
  //           'sequence_code' => $request->input('sequence_code'),
  //           'tenant_id' => tenant()->id,
  //         ]
  //       ]);

  //       if ($response->getStatusCode() === 200) {
  //         return back()->with('success', 'Sequence execution started');
  //       } else {
  //         return back()->with('error', 'Failed to enqueue job');
  //       }
  //     } catch (\GuzzleHttp\Exception\ClientException $e) {
  //       if ($e->getResponse()->getStatusCode() === 409) {
  //         return back()->with('error', 'Entity already has a pending sequence execution');
  //       }
  //       throw $e;
  //     }
  //   } catch (\Exception $e) {
  //     \Log::error($e->getMessage());
  //     return back()->with('error', 'Internal Server Error');
  //   }
  // }
  public function executeSequenceJSON(Request $request, string $id): JsonResponse
  {
    $request->validate([
      'sequence_code' => 'required|string|size:4'
    ]);

    try {
      $entity = DB::selectOne("
            SELECT e.*, es.entity_type, es.action_id
            FROM entities e
            JOIN action_entity_status es ON es.entity_id = e.id
            WHERE e.id = ?
        ", [$id]);

      \Log::info('Entity: ' . json_encode($entity));

      if (!$entity) {
        return response()->json([
          'success' => false,
          'error' => 'Entity not found'
        ], 404);
      }

      \Log::info('Entity: ' . json_encode($entity));

      // Call the actions API to enqueue the job
      $client = new \GuzzleHttp\Client();
      try {
        $response = $client->post(env('ACTIONS_API_URL') . '/enqueue', [
          'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key' => env('ACTIONS_API_KEY')
          ],
          'json' => [
            'entity_id' => $id,
            'entity_type' => $entity->entity_type,
            'sequence_code' => $request->input('sequence_code'),
            'tenant_id' => tenant()->id,
          ]
        ]);

        if ($response->getStatusCode() === 200) {
          return response()->json([
            'success' => true,
            'message' => 'Sequence execution started'
          ]);
        } else {
          return response()->json([
            'success' => false,
            'error' => 'Failed to enqueue job'
          ], 500);
        }
      } catch (\GuzzleHttp\Exception\ClientException $e) {
        if ($e->getResponse()->getStatusCode() === 409) {
          return response()->json([
            'success' => false,
            'error' => 'Entity already has a pending sequence execution'
          ], 409);
        }
        throw $e;
      }
    } catch (\Exception $e) {
      \Log::error($e->getMessage());
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }
}
