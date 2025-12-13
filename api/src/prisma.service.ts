import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 🔒 This is the ONLY client services are allowed to use
  private extendedClient!: PrismaClient;

  constructor(private readonly cls: ClsService) {
    super({ log: ['warn', 'error'] });
  }

  async onModuleInit() {
    await this.$connect();

    // Capture base client to avoid recursion
    const baseClient = this;

    this.extendedClient = baseClient.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args }) => {
            /**
             * 🚨 FAIL-FAST SAFETY
             * If TX_CONFIGURED is true, someone is incorrectly using
             * this.prisma.client INSIDE prisma.transaction().
             */
            if (this.cls.get('TX_CONFIGURED')) {
              throw new InternalServerErrorException(
                `Unsafe Prisma usage detected.
Do NOT use this.prisma.client inside prisma.transaction().
Use the provided 'tx' argument instead.`,
              );
            }

            // 1️⃣ Read request context
            const tenantId = this.cls.get('tenantId') ?? '';
            const role = this.cls.get('userRole') ?? 'ANONYMOUS';
            const userId = this.cls.get('userId') ?? '';
            const isSystem = this.cls.get('isSystem') ?? false;

            // 2️⃣ Decide DB role
            const dbRole =
              isSystem || role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : role;

            /**
             * 3️⃣ RLS SAFE EXECUTION
             * - Start transaction → guarantees single DB connection
             * - Set RLS session variables on THAT connection
             * - Execute query on SAME connection
             */
            return baseClient.$transaction(async (tx) => {
              await tx.$executeRaw`
                SELECT
                  set_config('app.tenant_id', ${tenantId}, true),
                  set_config('app.role', ${dbRole}, true),
                  set_config('app.user_id', ${userId}, true)
              `;

              return this.cls.run(async () => {
                this.cls.set('TX_CONFIGURED', true);
                return (tx as any)[model][operation](args);
              });
            });
          },
        },
      },
    }) as PrismaClient;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * 🌟 SAFE CLIENT
   * MUST be used for all normal queries
   */
  get client(): PrismaClient {
    if (!this.extendedClient) {
      throw new InternalServerErrorException(
        'PrismaService not initialized: secure RLS client missing.',
      );
    }
    return this.extendedClient;
  }

  /**
   * 🔄 SAFE TRANSACTION
   * Use for multi-query atomic operations
   */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const tenantId = this.cls.get('tenantId') ?? '';
    const role = this.cls.get('userRole') ?? 'ANONYMOUS';
    const userId = this.cls.get('userId') ?? '';
    const isSystem = this.cls.get('isSystem') ?? false;

    const dbRole =
      isSystem || role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : role;

    return super.$transaction(async (tx) => {
      // Set session variables ONCE for entire transaction
      await tx.$executeRaw`
        SELECT
          set_config('app.tenant_id', ${tenantId}, true),
          set_config('app.role', ${dbRole}, true),
          set_config('app.user_id', ${userId}, true)
      `;

      return this.cls.run(async () => {
        this.cls.set('TX_CONFIGURED', true);
        return fn(tx);
      });
    });
  }

  /**
   * 🔓 SYSTEM MODE (login, cron jobs)
   */
  async runUnscoped<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.cls.run(async () => {
      this.cls.set('isSystem', true);
      return fn(this.client);
    });
  }

  /**
   * 🛡️ MANUAL CONTEXT (refresh / logout)
   */
  async runWithContext<T>(
    ctx: { tenantId: string | null; role: string; userId: string },
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.cls.run(async () => {
      this.cls.set('tenantId', ctx.tenantId);
      this.cls.set('userRole', ctx.role);
      this.cls.set('userId', ctx.userId);
      this.cls.set('isSystem', false);
      return fn();
    });
  }
}
