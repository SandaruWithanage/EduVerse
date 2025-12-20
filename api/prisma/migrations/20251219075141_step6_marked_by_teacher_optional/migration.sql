-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_markedByTeacherId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "markedByTeacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedByTeacherId_fkey" FOREIGN KEY ("markedByTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
