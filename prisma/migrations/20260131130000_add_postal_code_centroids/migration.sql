CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Contact"
  ADD COLUMN "countryCode" CHAR(2),
  ADD COLUMN "latitude" DECIMAL(9, 6),
  ADD COLUMN "longitude" DECIMAL(9, 6);

CREATE TABLE "PostalCodeCentroid" (
  "countryCode" CHAR(2) NOT NULL,
  "postalCode" VARCHAR(32) NOT NULL,
  "placeName" VARCHAR(255),
  "admin1" VARCHAR(255),
  "admin1Code" VARCHAR(50),
  "admin2" VARCHAR(255),
  "admin2Code" VARCHAR(50),
  "admin3" VARCHAR(255),
  "admin3Code" VARCHAR(50),
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "accuracy" INTEGER,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "PostalCodeCentroid_pkey" PRIMARY KEY ("countryCode", "postalCode")
);

CREATE INDEX "PostalCodeCentroid_postalCode_idx" ON "PostalCodeCentroid"("postalCode");
CREATE INDEX "Contact_geo_idx" ON "Contact"
  USING GIST (geography(ST_MakePoint("longitude", "latitude")));
