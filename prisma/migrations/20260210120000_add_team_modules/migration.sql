-- Add team-level module configuration
ALTER TABLE "Teams"
ADD COLUMN "modules" "AppModule"[] NOT NULL DEFAULT ARRAY['CRM', 'FUNDING']::"AppModule"[];
