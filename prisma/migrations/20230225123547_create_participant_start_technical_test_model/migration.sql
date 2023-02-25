-- AlterTable
ALTER TABLE "ParticipantAnswersToTechnicalTest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ParticipantStartTechnicalTest" (
    "userId" INTEGER NOT NULL,
    "technicalTestId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantStartTechnicalTest_pkey" PRIMARY KEY ("userId","technicalTestId")
);

-- AddForeignKey
ALTER TABLE "ParticipantStartTechnicalTest" ADD CONSTRAINT "ParticipantStartTechnicalTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantStartTechnicalTest" ADD CONSTRAINT "ParticipantStartTechnicalTest_technicalTestId_fkey" FOREIGN KEY ("technicalTestId") REFERENCES "TechnicalTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
