-- AlterTable
ALTER TABLE "CampaignMessage" ADD COLUMN     "providerRawResponse" JSONB,
ADD COLUMN     "providerTimestamp" TIMESTAMP(3);
