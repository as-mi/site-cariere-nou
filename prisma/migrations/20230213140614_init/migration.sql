-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARTICIPANT', 'RECRUITER');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- CreateTable
CREATE TABLE "SettingValue" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SettingValue_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "passwordHash" TEXT,
    "passwordResetToken" TEXT,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "logoImageId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "thisYearPartner" BOOLEAN NOT NULL DEFAULT false,
    
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "workSchedule" TEXT NOT NULL,
    "workModel" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activeTechnicalTestId" INTEGER,
    "technicalTestIsMandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantApplyToPosition" (
    "userId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL,

    CONSTRAINT "ParticipantApplyToPosition_pkey" PRIMARY KEY ("userId","positionId")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_logoImageId_key" ON "Company"("logoImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_activeTechnicalTestId_key" ON "Position"("activeTechnicalTestId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_activeTechnicalTestId_fkey" FOREIGN KEY ("activeTechnicalTestId") REFERENCES "TechnicalTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantApplyToPosition" ADD CONSTRAINT "ParticipantApplyToPosition_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalTest" ADD CONSTRAINT "TechnicalTest_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswersToTechnicalTest" ADD CONSTRAINT "ParticipantAnswersToTechnicalTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswersToTechnicalTest" ADD CONSTRAINT "ParticipantAnswersToTechnicalTest_technicalTestId_fkey" FOREIGN KEY ("technicalTestId") REFERENCES "TechnicalTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
