<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        DB::statement("DROP VIEW IF EXISTS action_queue_sequence_validation cascade");
        DB::statement("
            CREATE OR REPLACE VIEW action_queue_sequence_validation AS
            SELECT 
                e.entity_id,
                e.entity_type,
                e.action_id as current_status_id,
                seq.id as sequence_id,
                seq.code as sequence_code,
                seq.status_on_sequence_success,
                seq.status_on_sequence_failure,
                s.code as current_status
            FROM action_entity_status e
            INNER JOIN action_entity_matrix em ON e.entity_type = em.entity_type
            INNER JOIN action_matrix_sequences ms ON em.action_matrix_id = ms.action_matrix_id
            INNER JOIN action_sequences seq ON ms.sequence_id = seq.id
            INNER JOIN action_statuses s ON ms.status_id = s.id
            WHERE s.id = e.action_id
        ");

        DB::statement("
            CREATE OR REPLACE VIEW action_queue_root_actions AS
            SELECT 
                sa.sequence_id,
                sa.action_id,
                a.code as action_code,
                a.type as action_type,
                a.config
            FROM action_sequence_actions sa
            INNER JOIN action_actions a ON sa.action_id = a.id
            WHERE sa.parent_action_id IS NULL
        ");

        DB::statement("
            CREATE OR REPLACE VIEW action_queue_child_actions AS
            SELECT 
                sa.sequence_id,
                sa.parent_action_id,
                sa.action_id,
                a.code as action_code,
                a.type as action_type,
                a.config
            FROM action_sequence_actions sa
            INNER JOIN action_actions a ON sa.action_id = a.id
            WHERE sa.parent_action_id IS NOT NULL
        ");

        DB::statement("
            CREATE OR REPLACE VIEW action_queue_initial_job AS
            SELECT 
                v.entity_id,
                v.entity_type,
                v.current_status,
                v.sequence_id,
                v.sequence_code,
                ra.action_id,
                ra.action_code,
                ra.action_type,
                ra.config,
                v.status_on_sequence_success,
                v.status_on_sequence_failure
            FROM action_queue_sequence_validation v
            INNER JOIN action_queue_root_actions ra ON v.sequence_id = ra.sequence_id
        ");
    }

    public function down()
    {
        DB::statement('DROP VIEW IF EXISTS action_queue_initial_job');
        DB::statement('DROP VIEW IF EXISTS action_queue_child_actions');
        DB::statement('DROP VIEW IF EXISTS action_queue_root_actions');
        DB::statement('DROP VIEW IF EXISTS action_queue_sequence_validation');
    }
};