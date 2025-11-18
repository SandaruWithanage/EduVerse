-- ================================================
-- FIX FULL TEXT SEARCH SUPPORT FOR StudentProfile & TeacherProfile
-- Ensures column, trigger, function, and index exist correctly
-- ================================================

-- -------------------------
-- 1. STUDENTPROFILE
-- -------------------------

-- 1.1 Add tsvector column if missing
ALTER TABLE "StudentProfile"
ADD COLUMN IF NOT EXISTS "fullNameSearch" tsvector;

-- 1.2 Backfill existing rows
UPDATE "StudentProfile"
SET "fullNameSearch" = to_tsvector('simple', COALESCE("fullName", ''));

-- 1.3 Create or replace function
CREATE OR REPLACE FUNCTION update_student_fullname_tsv() RETURNS trigger AS $$
BEGIN
  NEW."fullNameSearch" :=
    to_tsvector('simple', COALESCE(NEW."fullName", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.4 Recreate trigger safely
DROP TRIGGER IF EXISTS student_fullname_search_trigger ON "StudentProfile";
CREATE TRIGGER student_fullname_search_trigger
BEFORE INSERT OR UPDATE ON "StudentProfile"
FOR EACH ROW
EXECUTE FUNCTION update_student_fullname_tsv();

-- 1.5 Create index (if not exists)
CREATE INDEX IF NOT EXISTS studentprofile_fullname_gin
ON "StudentProfile"
USING GIN ("fullNameSearch");


-- -------------------------
-- 2. TEACHERPROFILE
-- -------------------------

-- 2.1 Add tsvector column if missing
ALTER TABLE "TeacherProfile"
ADD COLUMN IF NOT EXISTS "fullNameSearch" tsvector;

-- 2.2 Backfill existing rows
UPDATE "TeacherProfile"
SET "fullNameSearch" = to_tsvector('simple', COALESCE("fullName", ''));

-- 2.3 Create or replace function
CREATE OR REPLACE FUNCTION update_teacher_fullname_tsv() RETURNS trigger AS $$
BEGIN
  NEW."fullNameSearch" :=
    to_tsvector('simple', COALESCE(NEW."fullName", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.4 Recreate trigger safely
DROP TRIGGER IF EXISTS teacher_fullname_search_trigger ON "TeacherProfile";
CREATE TRIGGER teacher_fullname_search_trigger
BEFORE INSERT OR UPDATE ON "TeacherProfile"
FOR EACH ROW
EXECUTE FUNCTION update_teacher_fullname_tsv();

-- 2.5 Create index (if not exists)
CREATE INDEX IF NOT EXISTS teacherprofile_fullname_gin
ON "TeacherProfile"
USING GIN ("fullNameSearch");
