-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "album_id" UUID,
    "kid_id" UUID,
    "uploaded_by" UUID NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "s3_key" VARCHAR(500) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "thumbnail_s3_key" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500) NOT NULL,
    "duration" DOUBLE PRECISION,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(50) NOT NULL,
    "codec" VARCHAR(50),
    "width" INTEGER,
    "height" INTEGER,
    "bitrate" INTEGER,
    "date_taken" TIMESTAMPTZ(6),
    "location" VARCHAR(200),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "kids_tagged" JSONB NOT NULL DEFAULT '[]',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videos_album_id_idx" ON "videos"("album_id");

-- CreateIndex
CREATE INDEX "videos_kid_id_idx" ON "videos"("kid_id");

-- CreateIndex
CREATE INDEX "videos_uploaded_by_idx" ON "videos"("uploaded_by");

-- CreateIndex
CREATE INDEX "videos_created_at_idx" ON "videos"("created_at");

-- CreateIndex
CREATE INDEX "videos_is_deleted_idx" ON "videos"("is_deleted");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_kid_id_fkey" FOREIGN KEY ("kid_id") REFERENCES "kids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
