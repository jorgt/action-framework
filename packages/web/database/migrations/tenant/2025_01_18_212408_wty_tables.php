<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up()
  {
    // Ensure the UUID extension is enabled
    Schema::create('warranty_claims', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()')); // Primary key: claim_id as UUID
      $table->string('claim_type');
      $table->string('status');
      $table->uuid('customer_id'); // Assuming customers also use UUIDs
      $table->date('submission_date')->nullable();
      $table->decimal('total_amount', 15, 2)->default(0);
      $table->string('currency', 3);
      $table->timestampsTz();
    });

    // Warranty Claim Versions
    Schema::create('warranty_claim_versions', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()')); // Primary key: version_id as UUID
      $table->uuid('warranty_claim_id'); // Foreign key to warranty_claims
      $table->unsignedInteger('version_number');
      $table->timestampTz('change_date')->useCurrent();
      $table->string('user_id');
      $table->text('description')->nullable();
      $table->string('status');
      $table->timestampsTz();

      $table->foreign('warranty_claim_id')->references('id')->on('warranty_claims')->onDelete('cascade');
    });

    // Warranty Claim Items
    Schema::create('warranty_claim_items', function (Blueprint $table) {
      $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()')); // Primary key: item_id as UUID
      $table->uuid('warranty_claim_id'); // Foreign key to warranty_claims
      $table->string('item_type');
      $table->string('part_number')->nullable();
      $table->integer('quantity')->default(1);
      $table->decimal('price', 15, 2)->default(0);
      $table->decimal('total_price', 15, 2)->default(0);
      $table->string('status');
      $table->timestampsTz();

      $table->foreign('warranty_claim_id')->references('id')->on('warranty_claims')->onDelete('cascade');
    });
  }

  public function down()
  {
    Schema::dropIfExists('warranty_claim_items');
    Schema::dropIfExists('warranty_claim_versions');
    Schema::dropIfExists('warranty_claims');
  }
};
