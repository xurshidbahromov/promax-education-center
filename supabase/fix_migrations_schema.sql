-- Create the supabase_migrations schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- Create the schema_migrations table inside it
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version character varying(255) NOT NULL,
    statements text[],
    name character varying(255),
    CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);

-- Grant appropriate permissions so that postgres and dashboard can access it
GRANT ALL ON SCHEMA supabase_migrations TO postgres;
GRANT ALL ON TABLE supabase_migrations.schema_migrations TO postgres;
GRANT ALL ON SCHEMA supabase_migrations TO dashboard_user;
GRANT ALL ON TABLE supabase_migrations.schema_migrations TO dashboard_user;
