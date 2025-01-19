<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActionSeeder extends Seeder
{
  public function run()
  {
    // Clear all tables first
    DB::table('action_entity_matrix')->delete();
    DB::table('action_entity_status')->delete();
    DB::table('entities')->delete();
    DB::table('action_matrix_sequences')->delete();
    DB::table('action_matrixes')->delete();
    DB::table('action_sequence_actions')->delete();
    DB::table('action_sequences')->delete();
    DB::table('action_actions')->delete();
    DB::table('action_statuses')->delete();

    // Insert statuses
    DB::table('action_statuses')->insert([
      ['id' => 'aa61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'VL01', 'description' => 'The status is pending.'],
      ['id' => 'ba61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'VL02', 'description' => 'The status is currently being worked on.'],
      ['id' => 'ca61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'VL03', 'description' => 'The status is completed.'],
      ['id' => 'da61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'VL04', 'description' => 'The status is failed.']
    ]);

    // Insert actions
    DB::table('action_actions')->insert([
      ['id' => 'ab61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'A1', 'type' => 'CHECK', 'name' => 'Check values', 'userAction' => true, 'description' => 'Review the new code changes.', 'config' => '{}'],
      ['id' => 'bb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'A2', 'type' => 'CHECK', 'name' => 'Check more values', 'userAction' => false, 'description' => 'Check some more values', 'config' => '{}'],
      ['id' => 'cb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'A3', 'type' => 'CHECK', 'name' => 'Check even MORE values', 'userAction' => false, 'description' => 'Check some more values', 'config' => '{}'],
      ['id' => 'db61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'A4', 'type' => 'CHECK', 'name' => 'Update Status', 'userAction' => false, 'description' => 'Update the current status of the project.', 'config' => '{}'],
      ['id' => 'eb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'B1', 'type' => 'CHECK', 'name' => 'Update Status', 'userAction' => true, 'description' => 'Update the current status of the project.', 'config' => '{}'],
      ['id' => '1b61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'C1', 'type' => 'CHECK', 'name' => 'Update Status', 'userAction' => false, 'description' => 'Update the current status of the project.', 'config' => '{}'],
      ['id' => '1c61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'D1', 'type' => 'CHECK', 'name' => 'Reset entity', 'userAction' => true, 'description' => 'Update the current status of the project.', 'config' => '{}']
    ]);

    // Insert entities (renamed from test_entities)
    DB::table('entities')->insert([
      ['id' => 'ac61da8c-938a-48a6-8eb6-55aa08cd1b08', 'name' => 'Test Entity 1'],
      ['id' => 'bc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'name' => 'Test Entity 2'],
      ['id' => 'cc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'name' => 'Test Entity 3'],
      ['id' => 'dc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'name' => 'Test Entity 4']
    ]);

    // Insert sequences
    DB::table('action_sequences')->insert([
      [
        'id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08',
        'code' => 'SEQ1',
        'description' => 'Start sequence.',
        'status_on_sequence_success' => 'ba61da8c-938a-48a6-8eb6-55aa08cd1b08',
        'status_on_sequence_failure' => 'da61da8c-938a-48a6-8eb6-55aa08cd1b08'
      ],
      [
        'id' => 'baa1da8c-938a-48a6-8eb6-55aa08cd1b08',
        'code' => 'SEQ2',
        'description' => 'Finish sequence.',
        'status_on_sequence_success' => 'ca61da8c-938a-48a6-8eb6-55aa08cd1b08',
        'status_on_sequence_failure' => 'da61da8c-938a-48a6-8eb6-55aa08cd1b08'
      ],
      [
        'id' => 'caa1da8c-938a-48a6-8eb6-55aa08cd1b08',
        'code' => 'SEQ3',
        'description' => 'Reset sequence.',
        'status_on_sequence_success' => 'aa61da8c-938a-48a6-8eb6-55aa08cd1b08',
        'status_on_sequence_failure' => 'da61da8c-938a-48a6-8eb6-55aa08cd1b08'
      ]
    ]);

    // Insert sequence actions
    DB::table('action_sequence_actions')->insert([
      ['sequence_id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => 'ab61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => null],
      ['sequence_id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => 'bb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => 'ab61da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['sequence_id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => 'cb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => 'bb61da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['sequence_id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => 'db61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => 'cb61da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['sequence_id' => 'baa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => 'eb61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => null],
      ['sequence_id' => 'baa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => '1b61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => 'eb61da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['sequence_id' => 'caa1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_id' => '1c61da8c-938a-48a6-8eb6-55aa08cd1b08', 'parent_action_id' => null]
    ]);

    // Insert action matrixes
    DB::table('action_matrixes')->insert([
      ['id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'M1', 'description' => 'Matrix 1'],
      ['id' => 'ef61da8c-938a-48a6-8eb6-55aa08cd1b08', 'code' => 'M2', 'description' => 'Matrix 2']
    ]);

    // Insert action matrix sequences
    DB::table('action_matrix_sequences')->insert([
      ['id' => 'ccc1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_matrix_id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08', 'status_id' => 'aa61da8c-938a-48a6-8eb6-55aa08cd1b08', 'sequence_id' => 'aaa1da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['id' => 'cca1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_matrix_id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08', 'status_id' => 'aa61da8c-938a-48a6-8eb6-55aa08cd1b08', 'sequence_id' => 'baa1da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['id' => 'ccb1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_matrix_id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08', 'status_id' => 'ba61da8c-938a-48a6-8eb6-55aa08cd1b08', 'sequence_id' => 'baa1da8c-938a-48a6-8eb6-55aa08cd1b08'],
      ['id' => 'cce1da8c-938a-48a6-8eb6-55aa08cd1b08', 'action_matrix_id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08', 'status_id' => 'ca61da8c-938a-48a6-8eb6-55aa08cd1b08', 'sequence_id' => 'caa1da8c-938a-48a6-8eb6-55aa08cd1b08']
    ]);

    // Insert entity status
    DB::table('action_entity_status')->insert([
      ['id' => 'ac61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_id' => 'ac61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_type' => 'TEST', 'status_code' => 'VL01'],
      ['id' => 'bc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_id' => 'bc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_type' => 'TEST', 'status_code' => 'VL02'],
      ['id' => 'cc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_id' => 'cc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_type' => 'TEST', 'status_code' => 'VL03'],
      ['id' => 'dc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_id' => 'dc61da8c-938a-48a6-8eb6-55aa08cd1b08', 'entity_type' => 'TEST', 'status_code' => 'VL04']
    ]);

    // Insert entity action matrix
    DB::table('action_entity_matrix')->insert([
      ['entity_type' => 'TEST', 'action_matrix_id' => 'ee61da8c-938a-48a6-8eb6-55aa08cd1b08']
    ]);
  }
}
