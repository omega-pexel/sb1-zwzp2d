import { Connection } from 'typeorm';
import { Db } from 'mongodb';
import { logInfo, logError } from '../../utils/logger';
import { metrics } from '../../utils/monitoring';
import { SchemaAnalyzer } from './SchemaAnalyzer';
import { TypeMapper } from './TypeMapper';
import { DataIntegrityChecker } from './DataIntegrityChecker';
import { BatchProcessor } from './BatchProcessor';
import { TransformationConfig } from '../../types/transformation';

export class TransformationService {
  private schemaAnalyzer: SchemaAnalyzer;
  private typeMapper: TypeMapper;
  private integrityChecker: DataIntegrityChecker;
  private batchProcessor: BatchProcessor;

  constructor() {
    this.schemaAnalyzer = new SchemaAnalyzer();
    this.typeMapper = new TypeMapper();
    this.integrityChecker = new DataIntegrityChecker();
    this.batchProcessor = new BatchProcessor();
  }

  async transformDatabase(
    sqlConnection: Connection,
    mongoDb: Db,
    config: TransformationConfig
  ): Promise<TransformationResult> {
    const startTime = Date.now();
    metrics.activeTransformations.increment();

    try {
      // Analyze SQL schema
      logInfo('Analyzing SQL schema...');
      const schema = await this.schemaAnalyzer.analyzeSchema(sqlConnection);
      
      // Map types and create MongoDB schema
      logInfo('Mapping schema to MongoDB...');
      const mongoSchema = this.typeMapper.mapSchema(schema);
      
      // Process data in batches
      logInfo('Processing data in batches...');
      const processedData = await this.batchProcessor.process(
        sqlConnection,
        mongoDb,
        schema,
        mongoSchema,
        config.batchSize
      );

      // Verify data integrity if enabled
      let integrityResult = null;
      if (config.validateData) {
        logInfo('Verifying data integrity...');
        integrityResult = await this.integrityChecker.verify(
          sqlConnection,
          mongoDb,
          schema
        );
      }

      const duration = Date.now() - startTime;
      metrics.transformationDuration.record(duration, 'sql');
      
      const result: TransformationResult = {
        success: true,
        duration,
        tablesProcessed: schema.tables.length,
        recordsProcessed: processedData.totalRecords,
        integrityCheck: integrityResult,
        schema: mongoSchema
      };

      logInfo('Database transformation completed', result);
      return result;

    } catch (error) {
      logError(error, { context: 'Database Transformation' });
      throw error;
    } finally {
      metrics.activeTransformations.decrement();
    }
  }
}

interface TransformationResult {
  success: boolean;
  duration: number;
  tablesProcessed: number;
  recordsProcessed: number;
  integrityCheck: any | null;
  schema: any;
}