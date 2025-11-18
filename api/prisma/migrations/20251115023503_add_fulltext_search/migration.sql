-- ================================================
-- FULL TEXT SEARCH SUPPORT FOR StudentProfile & TeacherProfile
-- Using PostgreSQL computed columns not tracked by Prisma
-- ================================================

-- -------------------------
-- 1. STUDENTPROFILE
-- -------------------------

ALTER TABLE "StudentProfile"
ADD COLUMN IF NOT EXISTS "fullNameSearch" tsvector;

UPDATE "StudentProfile"
SET "fullNameSearch" = to_tsvector('simple', COALESCE("fullName", ''));

CREATE OR REPLACE FUNCTION update_student_fullname_tsv() RETURNS trigger AS $$
BEGIN
  NEW."fullNameSearch" :=
    to_tsvector('simple', COALESCE(NEW."fullName", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS student_fullname_search_trigger ON "StudentProfile";
CREATE TRIGGER student_fullname_search_trigger
BEFORE INSERT OR UPDATE ON "StudentProfile"
FOR EACH ROW
EXECUTE FUNCTION update_student_fullname_tsv();

CREATE INDEX IF NOT EXISTS studentprofile_fullname_gin
ON "StudentProfile"
USING GIN ("fullNameSearch");


-- -------------------------
-- 2. TEACHERPROFILE
-- -------------------------

ALTER TABLE "TeacherProfile"
ADD COLUMN IF NOT EXISTS "fullNameSearch" tsvector;

UPDATE "TeacherProfile"
SET "fullNameSearch" = to_tsvector('simple', COALESCE("fullName", ''));

CREATE OR REPLACE FUNCTION update_teacher_fullname_tsv() RETURNS trigger AS $$
BEGIN
  NEW."fullNameSearch" :=
    to_tsvector('simple', COALESCE(NEW."fullName", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS teacher_fullname_search_trigger ON "TeacherProfile";
CREATE TRIGGER teacher_fullname_search_trigger
BEFORE INSERT OR UPDATE ON "TeacherProfile"
FOR EACH ROW
EXECUTE FUNCTION update_teacher_fullname_tsv();

CREATE INDEX IF NOT EXISTS teacherprofile_fullname_gin
ON "TeacherProfile"
USING GIN ("fullNameSearch");