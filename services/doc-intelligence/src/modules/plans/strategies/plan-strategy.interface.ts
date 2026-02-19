export interface PlanStrategy {
  execute(input: { file: Express.Multer.File; userId: string }): Promise<any>;
}
