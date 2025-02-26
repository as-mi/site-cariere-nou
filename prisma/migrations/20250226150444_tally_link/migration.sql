/*
  Warnings:

  - Added the required column `tallyLink` to the `TechnicalTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TechnicalTest" ADD COLUMN     "tallyLink" TEXT NOT NULL;
