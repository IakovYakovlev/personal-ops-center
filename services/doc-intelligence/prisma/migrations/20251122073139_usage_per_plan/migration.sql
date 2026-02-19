/*
  Warnings:

  - A unique constraint covering the columns `[userId,plan]` on the table `Usage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Usage_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_plan_key" ON "Usage"("userId", "plan");
