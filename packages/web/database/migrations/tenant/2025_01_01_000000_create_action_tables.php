<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  public function up()
  {
    // Create UUID extension
    DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create enums
    DB::statement("CREATE TYPE action_type AS ENUM ('CODE', 'STATUS', 'CHECK', 'CALL')");
    DB::statement("CREATE TYPE event_status_type AS ENUM ('IN PROCESS', 'PENDING', 'PROCESSED', 'ERROR', 'FAILED')");
    DB::statement("CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')");

    // Create actions table
    Schema::create('action_actions', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->string('code', 4);
      $table->string('type'); // action_type enum
      $table->text('name');
      $table->boolean('userAction')->default(false);
      $table->text('description')->nullable();
      $table->jsonb('config')->default('{}');
      $table->timestampsTz();
    });

    // Create statuses table
    Schema::create('action_statuses', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->string('code', 4)->unique();
      $table->text('description')->nullable();
      $table->timestampsTz();
    });

    // Create sequences table
    Schema::create('action_sequences', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->string('code', 4);
      $table->text('description')->nullable();
      $table->uuid('status_on_sequence_success')->nullable();
      $table->uuid('status_on_sequence_failure')->nullable();
      $table->timestampsTz();

      $table->foreign('status_on_sequence_success')
        ->references('id')
        ->on('action_statuses')
        ->onDelete('set null');
      $table->foreign('status_on_sequence_failure')
        ->references('id')
        ->on('action_statuses')
        ->onDelete('set null');
    });

    // Create sequence_actions table
    Schema::create('action_sequence_actions', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->uuid('sequence_id');
      $table->uuid('action_id');
      $table->uuid('parent_action_id')->nullable();
      $table->timestampsTz();

      $table->unique(['sequence_id', 'action_id']);

      $table->foreign('sequence_id')
        ->references('id')
        ->on('action_sequences')
        ->onDelete('cascade');
      $table->foreign('action_id')
        ->references('id')
        ->on('action_actions')
        ->onDelete('cascade');
      $table->foreign('parent_action_id')
        ->references('id')
        ->on('action_actions')
        ->onDelete('cascade');
    });

    // Create action_matrixes table
    Schema::create('action_matrixes', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->string('code', 4)->unique();
      $table->text('description')->nullable();
      $table->timestampsTz();
    });

    // Create action_matrix_sequences table
    Schema::create('action_matrix_sequences', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->uuid('action_matrix_id');
      $table->uuid('status_id');
      $table->uuid('sequence_id');
      $table->timestampsTz();

      $table->unique(['action_matrix_id', 'status_id', 'sequence_id']);

      $table->foreign('action_matrix_id')
        ->references('id')
        ->on('action_matrixes')
        ->onDelete('cascade');
      $table->foreign('status_id')
        ->references('id')
        ->on('action_statuses')
        ->onDelete('cascade');
      $table->foreign('sequence_id')
        ->references('id')
        ->on('action_sequences')
        ->onDelete('cascade');
    });

    // Create entities table (renamed from test_entities)
    Schema::create('entities', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->text('name');
      $table->timestampsTz();
    });

    // Create entity_status table
    Schema::create('action_entity_status', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->uuid('entity_id');
      $table->string('entity_type', 10);
      $table->uuid('action_id');
      $table->timestampsTz();

      $table->unique(['entity_id', 'entity_type']);

      $table->foreign('action_id')
        ->references('id')
        ->on('action_statuses')
        ->onDelete('cascade');
    });

    // Create entity_action_matrix table
    Schema::create('action_entity_matrix', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->string('entity_type', 10);
      $table->uuid('action_matrix_id');
      $table->timestampsTz();

      $table->unique(['entity_type', 'action_matrix_id']);

      $table->foreign('action_matrix_id')
        ->references('id')
        ->on('action_matrixes')
        ->onDelete('cascade');
    });

    // Create action_log table
    Schema::create('action_log', function (Blueprint $table) {
      $table->id(); // bigserial
      $table->uuid('entity_id');
      $table->text('entity_type');
      $table->uuid('action_id');
      $table->jsonb('payload')->default('{}');
      $table->jsonb('result')->default('{}');
      $table->timestampTz('created_at')->useCurrent();

      $table->foreign('action_id')
        ->references('id')
        ->on('action_actions')
        ->onDelete('cascade');
    });

    // Create webhooks table
    Schema::create('action_webhooks', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
      $table->jsonb('headers')->default('[]'); // array of JSON objects
      $table->jsonb('parameters')->default('[]'); // array of JSON objects
      $table->text('url');
      $table->string('method'); // http_method enum
      $table->jsonb('fields')->default('[]'); // array of JSON objects
      $table->text('name');
      $table->timestampsTz();
    });

    // Create webhooks_log table
    Schema::create('action_webhooks_log', function (Blueprint $table) {
      $table->id(); // bigserial
      $table->uuid('hook_id');
      $table->timestampTz('created_at')->useCurrent();
      $table->text('response')->nullable();
      $table->integer('status_code')->nullable();

      $table->foreign('hook_id')
        ->references('id')
        ->on('action_webhooks')
        ->onDelete('cascade');
    });

    // Set enum columns after table creation
    DB::statement("ALTER TABLE action_actions ALTER COLUMN type TYPE action_type USING type::action_type");
    DB::statement("ALTER TABLE action_webhooks ALTER COLUMN method TYPE http_method USING method::http_method");
  }

  public function down()
  {
    // Drop tables in reverse order to handle foreign key constraints
    Schema::dropIfExists('action_webhooks_log');
    Schema::dropIfExists('action_webhooks');
    Schema::dropIfExists('action_log');
    Schema::dropIfExists('action_entity_matrix');
    Schema::dropIfExists('action_entity_status');
    Schema::dropIfExists('entities');
    Schema::dropIfExists('action_matrix_sequences');
    Schema::dropIfExists('action_matrixes');
    Schema::dropIfExists('action_sequence_actions');
    Schema::dropIfExists('action_sequences');
    Schema::dropIfExists('action_statuses');
    Schema::dropIfExists('action_actions');

    // Drop enums
    DB::statement('DROP TYPE IF EXISTS http_method');
    DB::statement('DROP TYPE IF EXISTS event_status_type');
    DB::statement('DROP TYPE IF EXISTS action_type');
  }
};
