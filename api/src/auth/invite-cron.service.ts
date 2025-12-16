import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { InviteMailerService } from './invite-mailer.service';

@Injectable()
export class InviteCronService {
  private readonly logger = new Logger(InviteCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: InviteMailerService,
  ) {}

  // ⏱ Runs every 5 minutes
  @Cron('*/5 * * * *')
  async processInvites() {
    this.logger.log('🔄 Checking pending parent invites');

    const users = await this.prisma.user.findMany({
      where: {
        invitePending: true,
      },
      include: {
        inviteTokens: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      take: 10, // throttle
    });

    for (const user of users) {
      const invite = user.inviteTokens[0];
      if (!invite) continue;

      try {
        await this.mailer.sendInvite({
          ...user,
          inviteToken: invite.token,
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            invitePending: false,
            inviteSentAt: new Date(),
          },
        });

        this.logger.log(`✅ Invite sent to ${user.email}`);
      } catch (err) {
        this.logger.error(`❌ Failed invite for ${user.email}`, err);
      }
    }
  }
}
