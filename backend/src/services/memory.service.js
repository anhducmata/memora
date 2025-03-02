import { pinecone, neo4jDriver, s3Client, config } from '../config/index.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../middleware/error.middleware.js';

export class MemoryService {
  constructor() {
    this.index = pinecone.Index(config.pineconeIndex);
  }

  async addMemory(userId, { text, date, media, tags }) {
    const session = neo4jDriver.session();
    try {
      // Generate embedding for the text (placeholder - replace with actual embedding generation)
      const vector = new Array(config.vectorDimensions).fill(0); // Placeholder vector

      // Upload media to S3 if provided
      let mediaUrl = null;
      if (media) {
        const key = `${userId}/${Date.now()}-${media.originalname}`;
        await s3Client.send(new PutObjectCommand({
          Bucket: config.s3Bucket,
          Key: key,
          Body: media.buffer,
          ContentType: media.mimetype,
        }));
        mediaUrl = `https://${config.s3Bucket}.s3.amazonaws.com/${key}`;
      }

      // Store in Pinecone
      const memoryId = `mem_${Date.now()}`;
      await this.index.upsert({
        vectors: [{
          id: memoryId,
          values: vector,
          metadata: {
            userId,
            text,
            date,
            mediaUrl,
          },
        }],
      });

      // Store in Neo4j
      const result = await session.run(
        `
        CREATE (m:Memory {
          id: $memoryId,
          text: $text,
          date: $date,
          mediaUrl: $mediaUrl,
          userId: $userId
        })
        WITH m
        UNWIND $tags as tag
        MERGE (t:Tag {name: tag.name, type: tag.type})
        CREATE (m)-[:TAGGED]->(t)
        RETURN m
        `,
        { memoryId, text, date, mediaUrl, userId, tags }
      );

      return {
        id: memoryId,
        text,
        date,
        mediaUrl,
        tags,
      };
    } finally {
      await session.close();
    }
  }

  async searchMemories(userId, { query, type = 'hybrid', tags = [], startDate, endDate }) {
    const session = neo4jDriver.session();
    try {
      let memories = [];

      if (type === 'vector' || type === 'hybrid') {
        // Generate query embedding (placeholder)
        const queryVector = new Array(config.vectorDimensions).fill(0);

        // Search in Pinecone
        const vectorResults = await this.index.query({
          vector: queryVector,
          filter: { userId },
          topK: 10,
        });

        memories = vectorResults.matches.map(match => ({
          id: match.id,
          score: match.score,
          ...match.metadata,
        }));
      }

      if (type === 'graph' || type === 'hybrid') {
        // Build Neo4j query
        let cypher = `
          MATCH (m:Memory)-[:TAGGED]->(t:Tag)
          WHERE m.userId = $userId
        `;

        if (tags.length > 0) {
          cypher += ` AND t.name IN $tags`;
        }
        if (startDate) {
          cypher += ` AND m.date >= $startDate`;
        }
        if (endDate) {
          cypher += ` AND m.date <= $endDate`;
        }

        cypher += `
          RETURN DISTINCT m,
          collect(t) as tags
          ORDER BY m.date DESC
        `;

        const result = await session.run(cypher, {
          userId,
          tags: tags.map(t => t.name),
          startDate,
          endDate,
        });

        const graphResults = result.records.map(record => {
          const memory = record.get('m').properties;
          const memoryTags = record.get('tags').map(t => t.properties);
          return { ...memory, tags: memoryTags };
        });

        if (type === 'graph') {
          memories = graphResults;
        } else {
          // Merge and deduplicate results for hybrid search
          const seen = new Set(memories.map(m => m.id));
          graphResults.forEach(result => {
            if (!seen.has(result.id)) {
              memories.push(result);
              seen.add(result.id);
            }
          });
        }
      }

      return memories;
    } finally {
      await session.close();
    }
  }

  async getTimeline(userId, { startDate, endDate }) {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `
        MATCH (m:Memory)
        WHERE m.userId = $userId
        AND m.date >= $startDate
        AND m.date <= $endDate
        RETURN m
        ORDER BY m.date
        `,
        { userId, startDate, endDate }
      );

      return result.records.map(record => record.get('m').properties);
    } finally {
      await session.close();
    }
  }

  async getMoodMap(userId) {
    // This would typically involve getting vectors from Pinecone
    // and performing clustering on them
    const vectorResults = await this.index.query({
      vector: new Array(config.vectorDimensions).fill(0),
      filter: { userId },
      topK: 100,
    });

    // Placeholder for clustering logic
    return vectorResults.matches.map(match => ({
      id: match.id,
      position: { x: Math.random(), y: Math.random() }, // Replace with actual 2D projection
      ...match.metadata,
    }));
  }
} 