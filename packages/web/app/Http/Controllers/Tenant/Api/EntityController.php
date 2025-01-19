<?php

namespace App\Http\Controllers\Tenant\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Api\EntityRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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
          s.id as sequence_id,
          s.code as sequence_code,
          s.description as sequence_description,
          ss.code as status_on_sequence_success_code,
          fs.code as status_on_sequence_failure_code
        FROM action_sequences s
        JOIN action_matrix_sequences ms ON ms.sequence_id = s.id
        JOIN action_entity_matrix em ON em.action_matrix_id = ms.action_matrix_id
        JOIN action_entity_status es ON es.entity_id = ?
        JOIN action_statuses ss ON s.status_on_sequence_success = ss.id
        JOIN action_statuses fs ON s.status_on_sequence_failure = fs.id
        WHERE em.entity_type = es.entity_type
        AND ms.status_id = (SELECT id FROM action_statuses WHERE code = es.status_code)
      )
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
              'sequence_id', seq.sequence_id,
              'sequence_code', seq.sequence_code,
              'sequence_description', seq.sequence_description,
              'status_on_sequence_success_code', seq.status_on_sequence_success_code,
              'status_on_sequence_failure_code', seq.status_on_sequence_failure_code
            )
          ) FILTER (WHERE seq.sequence_id IS NOT NULL),
          '[]'::json
        ) as sequences
      FROM entities e
      JOIN action_entity_status es ON es.entity_id = e.id
      JOIN action_statuses s ON s.code = es.status_code
      LEFT JOIN entity_sequences seq ON true
      WHERE e.id = ?
      GROUP BY e.id, e.name, e.created_at, e.updated_at, es.status_code, es.entity_type, s.description
    ", [$id, $id]);

    if (empty($entity)) {
      return response()->json([
        'success' => false,
        'error' => 'Entity not found'
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => $entity[0]
    ]);
  }

  /**
   * Get all entities with their current status
   */
  public function index(): JsonResponse
  {
    $entities = DB::select("
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
        WHERE ms.status_id = (SELECT id FROM action_statuses WHERE code = es.status_code)
        GROUP BY es.entity_id
      )
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
        COALESCE(seq.sequences, '[]'::json) as sequences
      FROM entities e
      JOIN action_entity_status es ON es.entity_id = e.id
      JOIN action_statuses s ON s.code = es.status_code
      LEFT JOIN entity_sequences seq ON seq.entity_id = e.id
      ORDER BY e.created_at DESC
    ");

    return response()->json([
      'success' => true,
      'data' => $entities
    ]);
  }

  /**
   * Execute a sequence on an entity
   */
  public function executeSequence(Request $request, string $id): JsonResponse
  {
    $request->validate([
      'sequence_code' => 'required|string|size:4'
    ]);

    try {
      $entity = DB::selectOne("
        SELECT e.*, es.entity_type, es.status_code
        FROM entities e
        JOIN action_entity_status es ON es.entity_id = e.id
        WHERE e.id = ?
      ", [$id]);

      if (!$entity) {
        return response()->json([
          'success' => false,
          'error' => 'Entity not found'
        ], 404);
      }

      // Get sequence details
      $sequence = DB::selectOne("
        SELECT s.*, m.id as matrix_id, m.code as matrix_code
        FROM action_sequences s
        JOIN action_matrix_sequences ms ON ms.sequence_id = s.id
        JOIN action_matrixes m ON m.id = ms.action_matrix_id
        JOIN action_entity_matrix em ON em.action_matrix_id = m.id
        WHERE s.code = ?
        AND em.entity_type = ?
        AND ms.status_id = (SELECT id FROM action_statuses WHERE code = ?)
      ", [$request->sequence_code, $entity->entity_type, $entity->status_code]);

      if (!$sequence) {
        return response()->json([
          'success' => false,
          'error' => 'Invalid sequence for current entity state'
        ], 400);
      }

      // Here we would dispatch a job to handle the sequence execution
      // For now we'll just return success

      return response()->json([
        'success' => true,
        'data' => []
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal Server Error'
      ], 500);
    }
  }
}
