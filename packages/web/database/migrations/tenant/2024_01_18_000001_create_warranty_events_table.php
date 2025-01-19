<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('warranty_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('warranty_id');
            $table->string('event_type');
            $table->jsonb('event_data');
            $table->timestamp('created_at');

            // Add a compound primary key
            $table->primary(['warranty_id', 'created_at']);

            // Retain indexes for querying
            $table->index('warranty_id');
            $table->index('event_type');
        });

        // Convert to hypertable
        DB::statement('SELECT create_hypertable(\'warranty_events\', \'created_at\')');

        Schema::create('warranty_embeddings', function (Blueprint $table) {
            $table->id();
            $table->uuid('warranty_id');
            $table->text('content');

            // Add index for warranty_id
            $table->index('warranty_id');
        });

        // Add the vector column after the table is created
        DB::statement('ALTER TABLE warranty_embeddings ADD COLUMN embedding vector(1536)');

        // Add the advanced index for vector similarity search
        DB::statement('CREATE INDEX warranty_embeddings_embedding_index ON warranty_embeddings USING ivfflat (embedding vector_cosine_ops)');

    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_embeddings');
        Schema::dropIfExists('warranty_events');
    }
};
