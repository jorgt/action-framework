<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
  private $redis;

  public function __construct()
  {
    $this->redis = Redis::connection();
  }

  public function index(): Response
  {
    $activeJobs = $this->redis->zrange('bull:action-queue:active', 0, -1);
    $waitingJobs = $this->redis->zrange('bull:action-queue:wait', 0, -1);

    $lockedEntityIds = collect([...$activeJobs, ...$waitingJobs])
      ->map(fn($job) => json_decode($job)?->data?->entityId)
      ->filter()
      ->unique()
      ->values();

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
            ORDER BY e.created_at DESC
        ");

    $entities = collect($entities)->map(function ($entity) use ($lockedEntityIds) {
      $entity->locked = $lockedEntityIds->contains($entity->id);
      $entity->sequences = json_decode($entity->sequences);
      return $entity;
    });

    return Inertia::render('tenant/dashboard', [
      'entities' => $entities,
      'stats' => [
        'active_jobs' => count($activeJobs),
        'waiting_jobs' => count($waitingJobs),
        'locked_entities' => $lockedEntityIds->count()
      ]
    ]);
  }

  public function show(int $entityId): Response
  {
    $activeJobs = collect($this->redis->zrange('bull:action-queue:active', 0, -1))
      ->map(fn($job) => json_decode($job))
      ->filter(fn($job) => $job?->data?->entityId === $entityId)
      ->values();

    $entity = DB::select("
            SELECT 
                e.*,
                es.entity_type,
                s.code as status_code,
                s.description as status_description
            FROM entities e
            JOIN action_entity_status es ON es.entity_id = e.id
            JOIN action_statuses s ON s.id = es.action_id
            WHERE e.id = ?
        ", [$entityId])[0] ?? abort(404);

    return Inertia::render('Dashboard/Show', [
      'entity' => $entity,
      'activeJobs' => $activeJobs,
      'isLocked' => $activeJobs->isNotEmpty()
    ]);
  }
}
