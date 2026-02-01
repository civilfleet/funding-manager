-- Import GeoNames postal code centroids.
-- Usage (example):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -v POSTAL_FILE="/path/to/allCountries.txt" \
--     -f scripts/import-postal-code-centroids.sql
--
-- Download:
--   https://download.geonames.org/export/zip/allCountries.zip
-- Extract to allCountries.txt and pass via POSTAL_FILE.

\set POSTAL_FILE :'POSTAL_FILE'
\if :{?POSTAL_FILE}
\else
  \echo 'POSTAL_FILE is required. Example: -v POSTAL_FILE="/path/allCountries.txt"'
  \quit 1
\endif

TRUNCATE TABLE "PostalCodeCentroid";

\copy "PostalCodeCentroid"(
  "countryCode",
  "postalCode",
  "placeName",
  "admin1",
  "admin1Code",
  "admin2",
  "admin2Code",
  "admin3",
  "admin3Code",
  "latitude",
  "longitude",
  "accuracy"
) FROM :'POSTAL_FILE' WITH (FORMAT csv, DELIMITER E'\t', NULL '', QUOTE E'\b');
