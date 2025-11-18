-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('NEW', 'PROMOTED', 'REPEATED', 'TRANSFERRED_IN', 'TRANSFERRED_OUT');

-- CreateEnum
CREATE TYPE "TeacherClassRole" AS ENUM ('CLASS_TEACHER', 'SUBJECT_TEACHER', 'ASSISTANT_TEACHER');

-- CreateTable
CREATE TABLE "StudentGradeClass" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "admissionStatus" "AdmissionStatus" NOT NULL,
    "transferReason" TEXT,
    "classIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGradeClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherGradeClass" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "roleInClass" "TeacherClassRole" NOT NULL,
    "subjectCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherGradeClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentGradeClass_classId_idx" ON "StudentGradeClass"("classId");

-- CreateIndex
CREATE INDEX "StudentGradeClass_gradeId_idx" ON "StudentGradeClass"("gradeId");

-- CreateIndex
CREATE INDEX "StudentGradeClass_academicYearId_idx" ON "StudentGradeClass"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGradeClass_studentId_academicYearId_key" ON "StudentGradeClass"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "TeacherGradeClass_gradeId_idx" ON "TeacherGradeClass"("gradeId");

-- CreateIndex
CREATE INDEX "TeacherGradeClass_classId_idx" ON "TeacherGradeClass"("classId");

-- CreateIndex
CREATE INDEX "TeacherGradeClass_academicYearId_idx" ON "TeacherGradeClass"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherGradeClass_teacherId_classId_academicYearId_key" ON "TeacherGradeClass"("teacherId", "classId", "academicYearId");

-- AddForeignKey
ALTER TABLE "StudentGradeClass" ADD CONSTRAINT "StudentGradeClass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass" ADD CONSTRAINT "StudentGradeClass_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass" ADD CONSTRAINT "StudentGradeClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeClass" ADD CONSTRAINT "StudentGradeClass_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass" ADD CONSTRAINT "TeacherGradeClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass" ADD CONSTRAINT "TeacherGradeClass_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass" ADD CONSTRAINT "TeacherGradeClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGradeClass" ADD CONSTRAINT "TeacherGradeClass_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
