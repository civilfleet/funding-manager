-- Add NOTE source to engagements
ALTER TYPE "EngagementSource" ADD VALUE 'NOTE';

-- Create contact submodule enum for restricted notes
CREATE TYPE "ContactSubmodule" AS ENUM ('SUPERVISION', 'EVENTS', 'SHOP');

-- Add optional restriction to engagement notes
ALTER TABLE "ContactEngagement"
ADD COLUMN "restrictedToSubmodule" "ContactSubmodule";
