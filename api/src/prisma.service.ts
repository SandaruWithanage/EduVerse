import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 1. Store the extended "safe" client instance
  private extendedClient: any;

  constructor(private readonly cls: ClsService) {
    super({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // 2. Globally extend the client to intercept ALL queries
    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ args, query }) => {
            // 3. Retrieve Context from CLS (set by your JwtAuthGuard)
            const tenantId = this.cls.get('tenantId');
            const role = this.cls.get('userRole');

            // 4. BYPASS RLS for Super Admins (Optional but recommended)
            if (role === 'SUPER_ADMIN') {
              return query(args);
            }

            // 5. ENFORCE RLS: If a tenant context exists, wrap in transaction
            if (tenantId) {
              return this.$transaction(async (tx) => {
                // Set Postgres session variables strictly for this transaction
                // The 'true' flag ensures these reset after the transaction commits/rollbacks
                await tx.$executeRawUnsafe(
                  `SELECT set_config('app.tenant_id', $1, true), set_config('app.role', $2, true)`,
                  tenantId,
                  role || 'ANONYMOUS',
                );
                return query(args);
              });
            }

            // 6. Fallback: Public routes or no-context
            // RLS Policies in DB will naturally block access if app.tenant_id is missing
            return query(args);
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 🌟 SAFEST WAY TO USE PRISMA
  // Use 'this.prisma.client.model.findMany()' in your services
  get client() {
    return this.extendedClient || this;
  }
}