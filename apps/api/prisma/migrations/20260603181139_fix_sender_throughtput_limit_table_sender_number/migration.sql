-- AlterTable
ALTER TABLE "SenderNumber" ADD COLUMN     "currentTier" TEXT,
ADD COLUMN     "qualityRating" TEXT,
ADD COLUMN     "throughputLimit" INTEGER NOT NULL DEFAULT 80;
