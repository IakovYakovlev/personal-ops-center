-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "chunksSaved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "documentId" TEXT;
