-- Add metadata JSONB column to photos table for AI-generated tags
ALTER TABLE "photos" ADD COLUMN "metadata" JSONB DEFAULT '{}'::jsonb;

-- Create GIN index on metadata for fast JSON queries
CREATE INDEX "photos_metadata_gin_idx" ON "photos" USING GIN ("metadata");

-- Add comment for documentation
COMMENT ON COLUMN "photos"."metadata" IS 'AI-generated metadata from AWS Rekognition: labels, faces, analyzed timestamp';
