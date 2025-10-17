-- AlterTable
ALTER TABLE "family_members" ADD COLUMN "relationship" VARCHAR(50);

-- Comment
COMMENT ON COLUMN "family_members"."relationship" IS 'Mối quan hệ: ông, bà, bố, mẹ, con, etc.';
