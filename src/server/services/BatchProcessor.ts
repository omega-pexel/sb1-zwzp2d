import { Connection } from 'typeorm';
import { Db } from 'mongodb';
import { logInfo, logError } from '../../utils/logger';
import { Schema, MongoSchema } from '../../types/schema';
import { metrics } from '../../utils/monitoring';

export class BatchProcessor {
  private processedCount = 0;

  async process(
    sqlConnection: Connection,
    mongoDb: Db,
    sqlSchema: Schema,
    mongoSchema: MongoSchema,
    batchSize: number
  ): Promise<void> {
    for (const table of sqlSchema.tables) {
      await this.processTable(
        sqlConnection,
        mongoDb,
        table,
        mongoSchema.collections.find(c => c.name === table.name)!,
        batchSize
      );
    }
  }

  private async processTable(
    sqlConnection: Connection,
    mongoDb: Db,
    table: any,
    collection: any,
    batchSize: number
  ): Promise<void> {
    let offset = 0;
    let hasMore = true;

    const startTime = Date.now();
    const collectionRef = mongoDb.collection(collection.name);

    while (hasMore) {
      try {
        // Get batch of records from SQL
        const records = await sqlConnection.query(
          `SELECT * FROM ${table.name} LIMIT ${batchSize} OFFSET ${offset}`
        );

        if (records.length === 0) {
          hasMore = false;
          break;
        }

        // Transform records to MongoDB format
        const transformedRecords = records.map(record =>
          this.transformRecord(record, collection)
        );

        // Insert batch into MongoDB
        await collectionRef.insertMany(transformedRecords);

        this.processedCount += records.length;
        offset += batchSize;

        // Log progress
        logInfo(`Processed batch for ${table.name}`, {
          processed: this.processedCount,
          offset,
        });

        // Update metrics
        metrics.set(`batch_progress_${table.name}`, offset);
      } catch (error) {
        logError(error, {
          context: 'Batch Processing',
          table: table.name,
          offset,
        });
        throw error;
      }
    }

    const duration = Date.now() - startTime;
    logInfo(`Completed processing ${table.name}`, {
      total: this.processedCount,
      duration,
    });
  }

  private transformRecord(record: any, collection: any): any {
    const transformed: any = {};

    for (const field of collection.fields) {
      transformed[field.name] = this.transformValue(
        record[field.name],
        field.type
      );
    }

    return transformed;
  }

  private transformValue(value: any, type: string): any {
    if (value === null) return null;

    switch (type) {
      case 'Date':
        return new Date(value);
      case 'Number':
        return Number(value);
      case 'Boolean':
        return Boolean(value);
      case 'Object':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  }

  getProcessedCount(): number {
    return this.processedCount;
  }
}