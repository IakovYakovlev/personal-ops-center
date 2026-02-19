import { Injectable } from '@nestjs/common';
import { PlanStrategy } from './plan-strategy.interface';

@Injectable()
export class UltraStrategy implements PlanStrategy {
  execute(input: { file: Express.Multer.File; userId: string }): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
