import { PlanExecutionResponse } from './plan-execution.types';

export interface PlanStrategy {
  execute(input: { file: Express.Multer.File; userId: string }): Promise<PlanExecutionResponse>;
}
