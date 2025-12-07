-- DropForeignKey
ALTER TABLE "TeacherGradeClass" DROP CONSTRAINT "TeacherGradeClass_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "TeacherGradeClass" ADD CONSTRAINT "TeacherGradeClass_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "TeacherGradeClass_teacherId_classId_academicYearId_subjectId_ke" RENAME TO "TeacherGradeClass_teacherId_classId_academicYearId_subjectI_key";
