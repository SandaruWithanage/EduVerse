// prisma/seed.ts
import "dotenv/config";
import {
  PrismaClient,
  UserRole,
  SchoolType,
  SchoolMedium,
  Gender,
  AttendanceStatus,
  Religion,
  Ethnicity,
  MotherTongue,
  TeacherAppointmentType,
  TeacherEmploymentStatus,
  AdmissionStatus,
  TeacherClassRole,
  Grade,
  Subject,
  TeacherProfile,
  StudentProfile,
  GradeLevel,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Deterministic absence logic
function isAbsent(studentIndex: number, dayOffset: number) {
  return (studentIndex + dayOffset) % 5 === 0;
}

// Generate initials
function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join(".");
}

function getGradeLevel(gradeNumber: number): GradeLevel {
  if (gradeNumber >= 1 && gradeNumber <= 5) return GradeLevel.PRIMARY;
  if (gradeNumber >= 6 && gradeNumber <= 9) return GradeLevel.JUNIOR;
  if (gradeNumber >= 10 && gradeNumber <= 11) return GradeLevel.ORDINARY_LEVEL;
  return GradeLevel.ADVANCED_LEVEL; // Grades 12–13
}


async function main() {
  console.log("🌱 Starting Phase 2 Seed...");

  const saltRounds = 10;
  const devPassword = await bcrypt.hash("Password@123", saltRounds);

  // ============================================================
  // 1. TENANT
  // ============================================================
  const tenant = await prisma.tenant.upsert({
    where: { schoolCode: "SCH-0001" },
    update: {},
    create: {
      name: "Demo National School",
      schoolCode: "SCH-0001",
      schoolType: SchoolType.ONE_AB,
      province: "Western",
      district: "Colombo",
      zone: "Colombo",
      division: "Colombo",
      mediums: [SchoolMedium.SINHALA, SchoolMedium.ENGLISH],
      addressLine1: "123, School Road",
      city: "Colombo",
    },
  });

  console.log("🏫 Tenant Ready");

  // ============================================================
  // 2. ACADEMIC YEAR
  // ============================================================
  const academicYear = await prisma.academicYear.upsert({
    where: { label: "2025/2026" },
    update: {},
    create: {
      label: "2025/2026",
      numericYear: 2025,
      start: new Date("2025-01-01"),
      end: new Date("2025-12-31"),
      active: true,
    },
  });

  const curriculum = await prisma.curriculum.upsert({
  where: { id: "curriculum-pre-2026" },
  update: {},
  create: {
    id: "curriculum-pre-2026",
    name: "Pre-2026",
    startYear: 2015,
    endYear: 2025,
    isActive: true,
  },
});

console.log("📚 Curriculum Ready");


  console.log("📅 Academic Year Ready");

  // ============================================================
  // 3. GRADES 1–13
  // ============================================================
  const grades: Grade[] = [];

  for (let i = 1; i <= 13; i++) {
    const g = await prisma.grade.upsert({
      where: { tenantId_gradeNumber: { tenantId: tenant.id, gradeNumber: i } },
      update: {},
      create: {
        tenantId: tenant.id,
        gradeNumber: i,
        gradeLevel: getGradeLevel(i),
        name: `Grade ${i}`,
        academicYearId: academicYear.id,
      },
    });

    grades.push(g);
  }

  const grade10 = grades.find((g) => g.gradeNumber === 10)!;

  console.log("📘 Grades Created");

  // ============================================================
  // 4. CLASSROOMS
  // ============================================================
  const class10A = await prisma.classroom.upsert({
    where: { tenantId_classCode: { tenantId: tenant.id, classCode: "10A" } },
    update: {},
    create: {
      tenantId: tenant.id,
      gradeId: grade10.id,
      className: "A",
      classCode: "10A",
      capacity: 40,
    },
  });

  const class10B = await prisma.classroom.upsert({
  where: { tenantId_classCode: { tenantId: tenant.id, classCode: "10B" } },
  update: {},
  create: {
    tenantId: tenant.id,
    gradeId: grade10.id,
    className: "B",
    classCode: "10B",
    capacity: 45,
  },
});


  console.log("CLASS_ID_10A =", class10A.id); 
  console.log("CLASS_ID_10B =", class10B.id); 

  console.log("🏫 Classroom 10A Ready");
  console.log("🏫 Classroom 10B Ready");

  // ============================================================
  // 5. SUBJECTS (Based on your schema)
  // ============================================================
  console.log("📚 Seeding Subjects...");

  const subjectList = [
  { code: "MATH_G10", name: "Mathematics", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
  { code: "SCI_G10", name: "Science", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
  { code: "ENG_G10", name: "English", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
  { code: "HIST_G10", name: "History", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
  { code: "ICT_G10", name: "ICT", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
  { code: "SIN_G10", name: "Sinhala", validGrades: [10, 11], gradeLevel: GradeLevel.ORDINARY_LEVEL },
];


  const subjectsDB: Subject[] = [];

  for (const s of subjectList) {
    const subject = await prisma.subject.upsert({
      where: {
  tenantId_code_curriculumId: {
    tenantId: tenant.id,
    code: s.code,
    curriculumId: curriculum.id,
  },
},
update: {
  name: s.name,
  validGrades: s.validGrades,
  gradeLevel: s.gradeLevel,
  isExamSubject: true,
  isCreditBearing: false,
  credits: null,
  stream: null,
  },
  create: {
    tenantId: tenant.id,
    code: s.code,
    name: s.name,
    gradeLevel: s.gradeLevel,
    curriculumId: curriculum.id,
    validGrades: s.validGrades,
    isExamSubject: true,
    isCreditBearing: false,
    credits: null,
    stream: null,
  },

    });
    subjectsDB.push(subject);
  }

  console.log(`📘 ${subjectsDB.length} Subjects Created`);

  // ============================================================
  // 6. TEACHERS + TeacherSubject + TeacherGradeClass
  // ============================================================
  const teachersDB: TeacherProfile[] = [];

  const teachersSeed = [
    { name: "Mr. Sampath", subject: "Mathematics" },
    { name: "Mrs. Kumari", subject: "Science" },
    { name: "Mr. Perera", subject: "History" },
    { name: "Ms. Silva", subject: "English" },
  ];

  for (let i = 0; i < teachersSeed.length; i++) {
    const t = teachersSeed[i];

    // 1️⃣ CREATE USER FOR TEACHER
const teacherUser = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenant.id,
      email: `teacher${i + 1}@demo.edu`,
    },
  },
  update: {},
  create: {
    tenantId: tenant.id,
    email: `teacher${i + 1}@demo.edu`,
    passwordHash: devPassword,
    role: UserRole.TEACHER,
    isActive: true,
  },
});

// 2️⃣ CREATE TEACHER PROFILE AND LINK USER
    const teacher = await prisma.teacherProfile.upsert({
      where: { nic: `19800${i}000V` },
      update: {
        userId: teacherUser.id,
      },
      create: {
        tenantId: tenant.id,
        userId: teacherUser.id, 

        systemCode: `EV-${tenant.schoolCode}-TEA-${String(i + 1).padStart(6, "0")}`,

        fullName: t.name,
        initials: getInitials(t.name),
        nic: `19800${i}000V`,
        tin: `TIN-${1000 + i}`,
        subjectCodes: [t.subject],
        appointmentType: TeacherAppointmentType.PERMANENT,
        employmentStatus: TeacherEmploymentStatus.ACTIVE,
        serviceStart: new Date(),
        dateOfBirth: new Date("1980-01-01"),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        religion: Religion.BUDDHIST,
        ethnicity: Ethnicity.SINHALA,
        motherTongue: MotherTongue.SINHALA,
      },
    });

    teachersDB.push(teacher);

    // Link teacher → subject
    const subjectMatch = subjectsDB.find((s) => s.name === t.subject);
    if (subjectMatch) {
      await prisma.teacherSubject.upsert({
        where: {
          tenantId_teacherId_subjectId: {
            tenantId: tenant.id,
            teacherId: teacher.id,
            subjectId: subjectMatch.id,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          teacherId: teacher.id,
          subjectId: subjectMatch.id,
        },
      });

      await prisma.teacherGradeClass.upsert({
        where: {
          teacherId_classId_academicYearId_subjectId: {
            teacherId: teacher.id,
            classId: class10A.id,
            academicYearId: academicYear.id,
            subjectId: subjectMatch.id,
          },
        },
        update: {},
        create: {
          teacherId: teacher.id,
          gradeId: grade10.id,
          classId: class10A.id,
          academicYearId: academicYear.id,
          subjectId: subjectMatch.id,
          roleInClass: TeacherClassRole.SUBJECT_TEACHER,
        },
      });
    }
  }

  console.log("👨‍🏫 Teachers + Subject Allocation Complete");

  // ============================================================
  // 7. STUDENTS + Parents + StudentParent
  // ============================================================
  console.log("👪 Seeding Students & Parents...");

  const studentsDB: StudentProfile[] = [];

  for (let i = 1; i <= 5; i++) {
    const student = await prisma.studentProfile.upsert({
      where: { tenantId_indexNumber: { tenantId: tenant.id, indexNumber: `IDX-00${i}` } },
      update: {},
      create: {
        tenantId: tenant.id,

        // ✅ REQUIRED FOR STEP 6
        systemCode: `EV-${tenant.schoolCode}-STU-${String(i).padStart(6, "0")}`,

        fullName: `Student ${i} Surname`,
        initials: `S.${i}`,
        gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        dateOfBirth: new Date("2010-05-15"),
        indexNumber: `IDX-00${i}`,
        admissionNumber: `ADM-00${i}`,
        admissionDate: new Date(),
        motherTongue: MotherTongue.SINHALA,
        religion: Religion.BUDDHIST,
        ethnicity: Ethnicity.SINHALA,
        isActive: true,
      },

    });

    studentsDB.push(student);

    await prisma.studentGradeClass.upsert({
      where: { studentId_academicYearId: { studentId: student.id, academicYearId: academicYear.id } },
      update: {},
      create: {
        studentId: student.id,
        gradeId: grade10.id,
        classId: class10A.id,
        academicYearId: academicYear.id,
        admissionStatus: AdmissionStatus.PROMOTED,
      },
    });

    // PARENT USER
    const parentUser = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: `parent${i}@demo.edu`,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: `parent${i}@demo.edu`,
        passwordHash: devPassword,
        role: UserRole.PARENT,
      },
    });

    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: parentUser.id,
        firstName: `Parent ${i}`,
        lastName: "Demo",
        nic: `9000${i}000V`,
        phone: `07712345${i}`,
      },
    });

    await prisma.studentParent.upsert({
      where: {
        tenantId_studentId_parentId: {
          tenantId: tenant.id,
          studentId: student.id,
          parentId: parent.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        studentId: student.id,
        parentId: parent.id,
      },
    });
  }

  console.log(`👨‍👩‍👧 ${studentsDB.length} Students Linked with Parents`);

  // ============================================================
  // 8. ATTENDANCE (Last 7 Days)
  // ============================================================
  console.log("📝 Generating Attendance...");

  let count = 0;
  const markerId = teachersDB[0].id;
  const today = new Date();

  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    for (let sIndex = 0; sIndex < studentsDB.length; sIndex++) {
      await prisma.attendance
        .create({
          data: {
            tenantId: tenant.id,
            studentId: studentsDB[sIndex].id,
            classId: class10A.id,
            academicYearId: academicYear.id,
            date: date,
            period: 1,
            status: isAbsent(sIndex, day)
              ? AttendanceStatus.ABSENT
              : AttendanceStatus.PRESENT,
            markedByTeacherId: markerId,
          },
        })
        .catch(() => {});
      count++;
    }
  }

  console.log(`📅 ${count} Attendance Records Generated`);

  // ============================================================
  // 9. ADMIN USERS
  // ============================================================
  // Ensure no duplicate system users exist
await prisma.user.deleteMany({
  where: {
    email: "superadmin@eduverse.local",
    tenantId: null,
  },
});

await prisma.user.create({
  data: {
    id: "superadmin-id",
    tenantId: null,
    email: "superadmin@eduverse.local",
    passwordHash: devPassword,
    role: UserRole.SUPER_ADMIN,
  },
});


  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "schooladmin@demo.edu",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "schooladmin@demo.edu",
      passwordHash: devPassword,
      role: UserRole.SCHOOL_ADMIN,
    },
  });

  await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenant.id,
      email: "principal@demo.edu",
    },
  },
  update: {},
  create: {
    tenantId: tenant.id,
    email: "principal@demo.edu",
    passwordHash: devPassword,
    role: UserRole.PRINCIPAL,
    isActive: true,
  },
});


  console.log("⭐ Admin Accounts Ready");
  console.log("🚀 Phase 2 Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
