<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::table('action_log', function (Blueprint $table) {
      $table->uuid('status_id')->nullable()->after('action_id');

      $table->foreign('status_id')
        ->references('id')
        ->on('action_statuses')
        ->onDelete('set null');
    });
  }

  public function down()
  {
    Schema::table('action_log', function (Blueprint $table) {
      $table->dropForeign(['status_id']);
      $table->dropColumn('status_id');
    });
  }
};
