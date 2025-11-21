import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper to get an RLS-enabled client instance
  getExtendedClient(tenantId: string, role: string) {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Wrap every query in a transaction to set local variables
            const [, result] = await this.$transaction([
              this.$executeRawUnsafe(
                `SELECT set_config('app.tenant_id', $1, true), set_config('app.role', $2, true)`,
                tenantId,
                role
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
