import { Injectable } from '@nestjs/common';
import { PlansService } from '../plans/plans.service';
import { PlanExecutionResponse } from '../plans/plan-execution.types';

@Injectable()
export class UploadService {
  constructor(private readonly planService: PlansService) {}

  async processUpload(
    file: Express.Multer.File,
    userId: string,
    plan: string,
  ): Promise<PlanExecutionResponse> {
    return await this.planService.executePlan(file, userId, plan);
  }
}
