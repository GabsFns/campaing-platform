-- AlterTable
ALTER TABLE "AudienceContact" ADD COLUMN     "sequence" BIGSERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "generationCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CampaignBatch" ADD COLUMN     "endContactId" TEXT,
ADD COLUMN     "endSequence" BIGINT,
ADD COLUMN     "startContactId" TEXT,
ADD COLUMN     "startSequence" BIGINT;

-- CreateIndex
CREATE INDEX "AudienceContact_audienceId_sequence_idx" ON "AudienceContact"("audienceId", "sequence");
