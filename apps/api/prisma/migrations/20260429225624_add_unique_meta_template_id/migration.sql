/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,metaTemplateId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_workspaceId_metaTemplateId_key" ON "Template"("workspaceId", "metaTemplateId");
