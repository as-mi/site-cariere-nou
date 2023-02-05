/*
  Warnings:

  - A unique constraint covering the columns `[activeTechnicalTestId]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "activeTechnicalTestId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Position_activeTechnicalTestId_key" ON "Position"("activeTechnicalTestId");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_activeTechnicalTestId_fkey" FOREIGN KEY ("activeTechnicalTestId") REFERENCES "TechnicalTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
