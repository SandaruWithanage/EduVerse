import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'], // Keeps your console clean
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 🌟 NEW FUNCTION: Creates a specific client for one request
  createRlsClient(tenantId: string, role: string) {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // This wraps EVERY query in a transaction to set the session variables safely
            const [, result] = await this.$transaction([
              this.$executeRawUnsafe(
                `SELECT set_config('app.tenant_id', $1, true), set_config('app.role', $2, true)`,
                tenantId,
                role,
              ),
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }
}
