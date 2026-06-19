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
    minSimilarity?: number;
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
          (
            SELECT
              CASE
                WHEN vectors.norm_a = 0 OR vectors.norm_b = 0 THEN NULL
                ELSE vectors.dot_product / (vectors.norm_a * vectors.norm_b)
              END
            FROM (
              SELECT
                SUM(a.value * b.value) AS dot_product,
                SQRT(SUM(a.value * a.value)) AS norm_a,
                SQRT(SUM(b.value * b.value)) AS norm_b
              FROM unnest(dc.embedding::double precision[]) WITH ORDINALITY AS a(value, idx)
              JOIN unnest(${queryEmbedding}::double precision[]) WITH ORDINALITY AS b(value, idx)
                ON a.idx = b.idx
            ) AS vectors
          ) AS similarity
        FROM "DocumentChunk" dc
        JOIN "Document" d ON d.id = dc."documentId"
        WHERE d."userId" = ${userId}
          AND dc."documentId" = ${documentId}
          AND dc.embedding IS NOT NULL
          AND cardinality(dc.embedding) = cardinality(${queryEmbedding}::double precision[])
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
