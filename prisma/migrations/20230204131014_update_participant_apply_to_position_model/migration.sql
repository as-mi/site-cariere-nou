-- AlterTable
ALTER TABLE "ParticipantApplyToPosition" DROP CONSTRAINT "ParticipantApplyToPosition_pkey",
ADD CONSTRAINT "ParticipantApplyToPosition_pkey" PRIMARY KEY ("userId", "positionId");
