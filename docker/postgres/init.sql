-- Enable the extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a function to create these extensions in new tenant databases
CREATE OR REPLACE FUNCTION create_extensions_for_tenant()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS timescaledb;
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
ALTER FUNCTION create_extensions_for_tenant() OWNER TO warranty;
