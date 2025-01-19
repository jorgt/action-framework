<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  public function up()
  {
    // Create view for available sequences
    DB::statement("
      CREATE OR REPLACE VIEW action_available_sequences AS
      SELECT 
        e.entity_id,
        e.status_code as current_status_code,
        s.description as current_status_description,
        eam.action_matrix_id,
        am.code as action_matrix_code,
        ams.sequence_id,
        ams.status_id,
        seq.code as sequence_code,
        seq.description as sequence_description,
        seq.status_on_sequence_success as status_on_sequence_success_id,
        sa.code as status_on_sequence_success_code,
        sa.description as status_on_sequence_success_description,
        seq.status_on_sequence_failure as status_on_sequence_failure_id,
        fa.code as status_on_sequence_failure_code,
        fa.description as status_on_sequence_failure_description
      FROM action_entity_status e
      INNER JOIN action_statuses s ON e.status_code = s.code
      INNER JOIN action_entity_matrix eam ON e.entity_type = eam.entity_type
      INNER JOIN action_matrixes am ON eam.action_matrix_id = am.id
      INNER JOIN action_matrix_sequences ams ON am.id = ams.action_matrix_id
        AND ams.status_id = s.id
      INNER JOIN action_sequences seq ON ams.sequence_id = seq.id
      INNER JOIN action_actions sa ON sa.id = seq.status_on_sequence_success
      INNER JOIN action_actions fa ON fa.id = seq.status_on_sequence_failure
    ");

    // Create view for available actions
    DB::statement("
      CREATE OR REPLACE VIEW action_available_actions AS
      SELECT 
        ase.entity_id,
        ase.current_status_code,
        ase.current_status_description,
        ase.action_matrix_id,
        ase.action_matrix_code,
        ase.sequence_id,
        ase.sequence_code,
        ase.sequence_description,
        ase.status_on_sequence_success_id,
        ase.status_on_sequence_success_code,
        ase.status_on_sequence_success_description,
        ase.status_on_sequence_failure_id,
        ase.status_on_sequence_failure_code,
        ase.status_on_sequence_failure_description,
        jsonb_agg(
          jsonb_build_object(
            'action_id', a.id,
            'action_code', a.code,
            'action_type', a.type,
            'parent_action_id', sa.parent_action_id,
            'config', a.config,
            'userAction', a.\"userAction\",
            'action_description', a.description
          )
        ) as actions
      FROM action_available_sequences ase
      INNER JOIN action_sequence_actions sa ON ase.sequence_id = sa.sequence_id
      INNER JOIN action_actions a ON sa.action_id = a.id
      GROUP BY 
        ase.entity_id,
        ase.current_status_code,
        ase.current_status_description,
        ase.action_matrix_id,
        ase.action_matrix_code,
        ase.sequence_id,
        ase.sequence_code,
        ase.sequence_description,
        ase.status_on_sequence_success_id,
        ase.status_on_sequence_success_code,
        ase.status_on_sequence_success_description,
        ase.status_on_sequence_failure_id,
        ase.status_on_sequence_failure_code,
        ase.status_on_sequence_failure_description
    ");
  }

  public function down()
  {
    DB::statement('DROP VIEW IF EXISTS action_available_actions');
    DB::statement('DROP VIEW IF EXISTS action_available_sequences');
  }
};
