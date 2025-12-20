/*
  Warnings:

  - Made the column `period` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `systemCode` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `systemCode` on table `TeacherProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "period" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "systemCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "TeacherProfile" ALTER COLUMN "systemCode" SET NOT NULL;
