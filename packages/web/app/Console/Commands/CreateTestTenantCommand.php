<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\DatabaseManager;
use Stancl\Tenancy\Features\TenantDatabaseManagement;

class CreateTestTenantCommand extends Command
{
    protected $signature = 'tenant:create-test {name}';
    protected $description = 'Create a test tenant with migrations and test data';

    public function handle()
    {
        $name = $this->argument('name');

        // Create database-safe ID from name (lowercase, no spaces, no special chars)
        $id = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));

        // Create domain from ID
        $domain = "{$id}.web.test";

        // Create the tenant
        $tenant = \App\Models\Tenant::create(['id' => $id]);

        // Create domain through relationship
        $tenant->domains()->create(['domain' => $domain]);

        $this->info("Created tenant: {$name}");
        $this->info("You can access the tenant at: http://{$domain}");
    }
}
