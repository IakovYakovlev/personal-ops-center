import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsageCheckResult } from 'src/modules/usage/dto/usage-check-result.dto';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOrCreate(userId: string, plan: string) {
    let usage = await this.prisma.usage.findUnique({ where: { userId_plan: { userId, plan } } });

    if (!usage) {
      usage = await this.prisma.usage.create({ data: { userId, plan } });
    } else if (usage.plan !== plan) {
      usage = await this.prisma.usage.update({
        where: { userId_plan: { userId, plan } },
        data: { plan },
      });
    }

    const days = (Date.now() - new Date(usage.periodStart).getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 30) {
      usage = await this.prisma.usage.update({
        where: { userId_plan: { userId, plan } },
        data: { totalSymbols: 0, totalRequests: 0, periodStart: new Date() },
      });
    }

    return usage;
  }

  async checkLimit(
    userId: string,
    planName: string,
    newSymbols: number,
  ): Promise<UsageCheckResult> {
    const plan = await this.prisma.plan.findUnique({ where: { name: planName } });

    if (!plan) throw new BadRequestException(`Unknown plan: ${planName}`);

    const usage = await this.findOrCreate(userId, planName);

    const canUse =
      usage.totalSymbols + newSymbols <= plan.limitSymbols &&
      usage.totalRequests + 1 <= plan.limitRequests;

    return {
      allowed: canUse,
      usage,
      plan,
      stats: {
        symbols: {
          used: usage.totalSymbols,
          limit: plan.limitSymbols,
          remaining: plan.limitSymbols - usage.totalSymbols,
          requestedSymbols: newSymbols,
        },
        requests: {
          used: usage.totalRequests,
          limit: plan.limitRequests,
          remaining: plan.limitRequests - usage.totalRequests,
        },
      },
    };
  }

  async increment(userId: string, plan: string, symbols: number) {
    await this.prisma.usage.update({
      where: { userId_plan: { userId, plan } },
      data: {
        totalSymbols: { increment: symbols },
        totalRequests: { increment: 1 },
        plan: plan,
      },
    });
  }
}
