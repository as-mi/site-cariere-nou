-- CreateTable
CREATE TABLE "TechnicalTest" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questions" JSONB NOT NULL,

    CONSTRAINT "TechnicalTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantAnswersToTechnicalTest" (
    "userId" INTEGER NOT NULL,
    "technicalTestId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,

    CONSTRAINT "ParticipantAnswersToTechnicalTest_pkey" PRIMARY KEY ("userId","technicalTestId")
);

-- AddForeignKey
ALTER TABLE "TechnicalTest" ADD CONSTRAINT "TechnicalTest_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswersToTechnicalTest" ADD CONSTRAINT "ParticipantAnswersToTechnicalTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswersToTechnicalTest" ADD CONSTRAINT "ParticipantAnswersToTechnicalTest_technicalTestId_fkey" FOREIGN KEY ("technicalTestId") REFERENCES "TechnicalTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
