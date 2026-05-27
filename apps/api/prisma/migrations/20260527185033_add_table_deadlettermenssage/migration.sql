-- CreateTable
CREATE TABLE "DeadLetterMessage" (
    "id" TEXT NOT NULL,
    "campaignMessageId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "queueName" TEXT,
    "jobName" TEXT,
    "failedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadLetterMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeadLetterMessage_campaignMessageId_idx" ON "DeadLetterMessage"("campaignMessageId");

-- CreateIndex
CREATE INDEX "DeadLetterMessage_failedAt_idx" ON "DeadLetterMessage"("failedAt");

-- AddForeignKey
ALTER TABLE "DeadLetterMessage" ADD CONSTRAINT "DeadLetterMessage_campaignMessageId_fkey" FOREIGN KEY ("campaignMessageId") REFERENCES "CampaignMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
