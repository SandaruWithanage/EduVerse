import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { tenantWhere } from 'src/common/tenant-where';
import { CreateStudentAdmissionDto } from './dto/create-student-admission.dto';
import { AddressType, UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { PasswordService } from '../auth/password.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly passwordService: PasswordService,
  ) {}

  // ======================================================
  // STEP 4C-3 — Student + Address + Parent + Link (+ optional user)
  // ======================================================
  async createAdmission(dto: CreateStudentAdmissionDto) {
    const tenantId = this.cls.get('tenantId');
    const role = this.cls.get('userRole') as UserRole;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }

    // Teachers & Parents can NEVER admit students
    if (role === UserRole.TEACHER || role === UserRole.PARENT) {
      throw new ForbiddenException();
    }

    const { profile, addresses, parent, autoInviteParentUser } = dto;

    // -------------------------
    // 1️⃣ Address validation
    // -------------------------
    if (!addresses || addresses.length === 0) {
      throw new BadRequestException('At least one address is required');
    }

    const permanent = addresses.find(
      (a) => a.type === AddressType.PERMANENT,
    );
    if (!permanent) {
      throw new BadRequestException('PERMANENT address is required');
    }

    const current = addresses.find(
      (a) => a.type === AddressType.CURRENT,
    );

    const permanentCount = addresses.filter(
      (a) => a.type === AddressType.PERMANENT,
    ).length;
    const currentCount = addresses.filter(
      (a) => a.type === AddressType.CURRENT,
    ).length;

    if (permanentCount > 1) {
      throw new BadRequestException(
        'Only one PERMANENT address is allowed',
      );
    }

    if (currentCount > 1) {
      throw new BadRequestException(
        'Only one CURRENT address is allowed',
      );
    }

    // -------------------------
    // 2️⃣ Date validation
    // -------------------------
    const dob = new Date(profile.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      throw new BadRequestException('Invalid dateOfBirth');
    }

    const admissionDate = new Date(profile.admissionDate);
    if (Number.isNaN(admissionDate.getTime())) {
      throw new BadRequestException('Invalid admissionDate');
    }

    // -------------------------
    // 3️⃣ Parent validation
    // -------------------------
    if (!parent) {
      throw new BadRequestException('Parent details are required');
    }

    if (!parent.firstName || !parent.lastName) {
      throw new BadRequestException(
        'Parent firstName and lastName are required',
      );
    }

    if (autoInviteParentUser && !parent.email) {
      throw new BadRequestException(
        'parent.email is required when autoInviteParentUser is true',
      );
    }

    // -------------------------
    // 4️⃣ Transaction
    // -------------------------
    return this.prisma.client.$transaction(async (tx) => {
      // 4A) Create StudentProfile
      const student = await tx.studentProfile.create({
        data: {
          tenantId,

          fullName: profile.fullName,
          initials: profile.initials ?? null,
          dateOfBirth: dob,
          gender: profile.gender,

          nic: profile.nic ?? null,
          birthCertificateNo: profile.birthCertificateNo ?? null,
          civilStatus: profile.civilStatus ?? null,
          medium: profile.medium ?? null,

          indexNumber: profile.indexNumber,
          admissionNumber: profile.admissionNumber,
          admissionDate,

          motherTongue: profile.motherTongue,
          religion: profile.religion,
          ethnicity: profile.ethnicity,
        },
      });

      // 4B) Create StudentAddress rows
      const addressRows: Prisma.StudentAddressCreateManyInput[] = [
        {
          tenantId,
          studentId: student.id,
          type: AddressType.PERMANENT,
          addressLine1: permanent.addressLine1,
          addressLine2: permanent.addressLine2 ?? null,
          city: permanent.city ?? null,
          gsDivisionCode: permanent.gsDivisionCode,
          districtCode: permanent.districtCode,
          telephone: permanent.telephone ?? null,
          mobile: permanent.mobile,
          residingFromDate: null,
        },
      ];

      if (current) {
        addressRows.push({
          tenantId,
          studentId: student.id,
          type: AddressType.CURRENT,
          addressLine1: current.addressLine1,
          addressLine2: current.addressLine2 ?? null,
          city: current.city ?? null,
          gsDivisionCode: current.gsDivisionCode,
          districtCode: current.districtCode,
          telephone: current.telephone ?? null,
          mobile: current.mobile,
          residingFromDate: current.residingFromDate
            ? new Date(current.residingFromDate)
            : null,
        });
      }

      await tx.studentAddress.createMany({ data: addressRows });

      // 4C) Create or reuse Parent
      let parentRecord = parent.nic
        ? await tx.parent.findFirst({
            where: { tenantId, nic: parent.nic },
          })
        : null;

      if (!parentRecord) {
        parentRecord = await tx.parent.create({
          data: {
            tenantId,
            firstName: parent.firstName,
            lastName: parent.lastName,
            phone: parent.phone ?? null,
            nic: parent.nic ?? null,
            userId: null,
          },
        });
      }

      // 4D) Optional Parent User
      if (autoInviteParentUser && parent.email && !parentRecord.userId) {
        const existingUser = await tx.user.findFirst({
          where: { tenantId, email: parent.email },
        });

        let userIdToAttach: string;

        if (existingUser) {
          if (existingUser.role !== UserRole.PARENT) {
            throw new BadRequestException(
              'Email already exists and is not a PARENT account',
            );
          }
          userIdToAttach = existingUser.id;
        } else {
          const tempPassword = crypto.randomBytes(6).toString('base64url');
          const passwordHash = await this.passwordService.hash(tempPassword);

          const createdUser = await tx.user.create({
            data: {
              tenantId,
              email: parent.email,
              passwordHash,
              role: UserRole.PARENT,
              isActive: true,
              invitePending: true,
              invitedAt: new Date(),
            },
          });

          const inviteToken = crypto.randomBytes(32).toString('hex');

          await tx.inviteToken.create({
            data: {
              userId: createdUser.id,
              token: inviteToken,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
            },
          });


          userIdToAttach = createdUser.id;
        }

        parentRecord = await tx.parent.update({
          where: { id: parentRecord.id },
          data: { userId: userIdToAttach },
        });
      }

      // 4E) Link Student ↔ Parent
      const existingLink = await tx.studentParent.findFirst({
        where: {
          tenantId,
          studentId: student.id,
          parentId: parentRecord.id,
        },
      });

      if (!existingLink) {
        await tx.studentParent.create({
          data: {
            tenantId,
            studentId: student.id,
            parentId: parentRecord.id,
            isPrimaryGuardian: true,
          },
        });
      }

      // 4F) Return clean response
      return tx.studentProfile.findUnique({
        where: { id: student.id },
        include: {
          addresses: true,
          familyLinks: {
            include: { parent: true },
          },
        },
      });
    });
  }

  // ======================================================
  // Read / Update APIs (unchanged)
  // ======================================================
  async findAll() {
    return this.prisma.client.studentProfile.findMany({
      where: { ...tenantWhere(this.cls) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.client.studentProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
      include: { addresses: true },
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: string, dto: any) {
    const existing = await this.prisma.client.studentProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });
    if (!existing) throw new NotFoundException('Student not found');

    return this.prisma.client.studentProfile.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.client.studentProfile.findFirst({
      where: { ...tenantWhere(this.cls), id },
    });
    if (!existing) throw new NotFoundException('Student not found');

    return this.prisma.client.studentProfile.delete({
      where: { id: existing.id },
    });
  }
}
