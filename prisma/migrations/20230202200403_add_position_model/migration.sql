/*
  Warnings:

  - You are about to drop the `ParticipantApplyToCompany` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ParticipantApplyToCompany" DROP CONSTRAINT "ParticipantApplyToCompany_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ParticipantApplyToCompany" DROP CONSTRAINT "ParticipantApplyToCompany_userId_fkey";

-- DropTable
DROP TABLE "ParticipantApplyToCompany";

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantApplyToPosition" (
    "userId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,

    CONSTRAINT "ParticipantApplyToPosition_pkey" PRIMARY KEY ("userId","resumeId","positionId")
);

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
