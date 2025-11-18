/*
  Warnings:

  - You are about to drop the column `fullNameSearch` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameSearch` on the `TeacherProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "studentprofile_fullname_gin";

-- DropIndex
DROP INDEX "teacherprofile_fullname_gin";

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "fullNameSearch";

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "fullNameSearch";
