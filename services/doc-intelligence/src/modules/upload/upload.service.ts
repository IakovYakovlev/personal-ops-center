import { Injectable } from '@nestjs/common';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class UploadService {
  constructor(private readonly planService: PlansService) {}

  async processUpload(file: Express.Multer.File, userId: string, plan: string) {
    return await this.planService.executePlan(file, userId, plan);
  }
}
