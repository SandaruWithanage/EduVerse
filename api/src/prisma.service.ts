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
    // 1. Capture the current instance context
    const client = this;

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // 2. Use the captured 'client' variable instead of 'this'
            const [, result] = await client.$transaction([
              client.$executeRawUnsafe(
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
