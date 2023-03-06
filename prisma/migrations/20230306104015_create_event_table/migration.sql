-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('WORKSHOP', 'PRESENTATION');

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "EventKind" NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL DEFAULT '',
    "facebookEventUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
