import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class InviteMailerService {
  private readonly logger = new Logger(InviteMailerService.name);

  async sendInvite(user: User & { inviteToken: string }) {
    const activationLink = `https://eduverse.app/activate?token=${user.inviteToken}`;

    // 🔧 Replace with real email provider later
    this.logger.log(
      `📧 Sending invite email to ${user.email}: ${activationLink}`,
    );

    // Example future:
    // await this.mailer.send({
    //   to: user.email,
    //   subject: 'Activate your EduVerse account',
    //   html: `<a href="${activationLink}">Activate account</a>`,
    // });
  }
}
