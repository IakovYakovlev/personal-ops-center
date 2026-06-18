import { BadRequestException, Injectable } from '@nestjs/common';
import { RetrievedChunk } from './dtos/retrieved-chunk.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RetrievalService {
  constructor(private readonly prisma: PrismaService) {}

  async findRelevantChunks(params: {
    userId: string;
    queryEmbedding: number[];
    topK?: number;
    minSimilarity: number;
    documentId: string;
  }): Promise<RetrievedChunk[]> {
    const { userId, queryEmbedding, topK = 3, minSimilarity = 0.75, documentId } = params;

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new BadRequestException('queryEmbedding must be a non-empty numeric array');
    }

    const hasInvalidValue = queryEmbedding.some((value) => !Number.isFinite(value));
    if (hasInvalidValue) {
      throw new BadRequestException('queryEmbedding contains invalid numeric values');
    }

    return this.prisma.$queryRaw<RetrievedChunk[]>`
      WITH ranked AS (
        SELECT
          dc.id,
          dc."documentId",
          dc."chunkIndex",
          dc.content,
          cosine_similarity(dc.embedding::double precision[], ${queryEmbedding}::double precision[]) AS similarity
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc."documentId"
        WHERE d."userId" = ${userId}
          AND dc."documentId" = ${documentId}
      )
      SELECT
        id,
        "documentId",
        "chunkIndex",
        content,
        similarity
      FROM ranked
      WHERE similarity IS NOT NULL
        AND similarity >= ${minSimilarity}
      ORDER BY similarity DESC
      LIMIT ${topK}
    `;
  }
}
