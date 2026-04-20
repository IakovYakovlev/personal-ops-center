import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma Service - Neural Assistant
 *
 * Architecture decisions:
 * - Read-only guard for Document/DocumentChunk: see ADR-0002
 *
 * Related docs:
 * - docs/architecture/adr/0002-document-tables-read-only-access.md
 */
const READ_ONLY_MODELS = new Set(['Document', 'DocumentChunk']);
const WRITE_OPERATIONS = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany',
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    super({
      adapter: new PrismaPg(pool),
    });

    this.registerReadOnlyGuards();
  }

  private registerReadOnlyGuards() {
    type LegacyUse = (
      middleware: (params: any, next: (params: any) => Promise<any>) => Promise<any>,
    ) => void;
    const legacyUse = (this as unknown as { $use?: LegacyUse }).$use;

    if (typeof legacyUse === 'function') {
      legacyUse(async (params, next) => {
        if (
          params.model &&
          READ_ONLY_MODELS.has(params.model) &&
          WRITE_OPERATIONS.has(params.action)
        ) {
          throw new Error(
            `Write operation "${params.action}" on "${params.model}" is blocked in neural-assistant.`,
          );
        }

        return next(params);
      });
      return;
    }

    this.blockWriteMethods('document', 'Document');
    this.blockWriteMethods('documentChunk', 'DocumentChunk');
  }

  private blockWriteMethods(
    delegateName: 'document' | 'documentChunk',
    modelName: 'Document' | 'DocumentChunk',
  ) {
    const delegate = (this as any)[delegateName];
    if (!delegate) {
      return;
    }

    for (const operation of WRITE_OPERATIONS) {
      if (typeof delegate[operation] !== 'function') {
        continue;
      }

      delegate[operation] = () =>
        Promise.reject(
          new Error(
            `Write operation "${operation}" on "${modelName}" is blocked in neural-assistant.`,
          ),
        );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  async onModuleInit() {
    await this.$connect();
  }
}
