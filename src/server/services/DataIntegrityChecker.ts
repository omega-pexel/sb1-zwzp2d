import { Connection } from 'typeorm';
import { Db } from 'mongodb';
import { logInfo, logError } from '../../utils/logger';
import { Schema } from '../../types/schema';
import * as tf from '@tensorflow/tfjs';

export class DataIntegrityChecker {
  private anomalyModel: tf.LayersModel;

  constructor() {
    this.initializeAnomalyModel();
  }

  private async initializeAnomalyModel() {
    // Initialize autoencoder for anomaly detection
    this.anomalyModel = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [64] }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'sigmoid' })
      ]
    });

    this.anomalyModel.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
  }

  async verify(
    sqlConnection: Connection,
    mongoDb: Db,
    schema: Schema
  ): Promise<VerificationResult> {
    const results: VerificationResult = {
      isValid: true,
      tables: [],
      anomalies: [],
      totalRecords: 0,
      verifiedRecords: 0
    };

    for (const table of schema.tables) {
      const tableResult = await this.verifyTable(
        sqlConnection,
        mongoDb,
        table
      );

      results.tables.push(tableResult);
      results.totalRecords += tableResult.totalRecords;
      results.verifiedRecords += tableResult.verifiedRecords;
      
      if (!tableResult.isValid) {
        results.isValid = false;
      }

      results.anomalies.push(...tableResult.anomalies);
    }

    logInfo('Data integrity verification completed', results);
    return results;
  }

  private async verifyTable(
    sqlConnection: Connection,
    mongoDb: Db,
    table: any
  ): Promise<TableVerificationResult> {
    const result: TableVerificationResult = {
      tableName: table.name,
      isValid: true,
      totalRecords: 0,
      verifiedRecords: 0,
      anomalies: []
    };

    try {
      const collection = mongoDb.collection(table.name);
      
      // Get record counts
      const sqlCount = await this.getSqlCount(sqlConnection, table.name);
      const mongoCount = await collection.countDocuments();
      
      result.totalRecords = sqlCount;

      if (sqlCount !== mongoCount) {
        result.isValid = false;
        result.anomalies.push({
          type: 'count_mismatch',
          description: `Record count mismatch: SQL=${sqlCount}, MongoDB=${mongoCount}`,
          severity: 'high'
        });
      }

      // Verify data samples
      const sampleResults = await this.verifySamples(
        sqlConnection,
        collection,
        table
      );

      result.verifiedRecords = sampleResults.verifiedCount;
      result.anomalies.push(...sampleResults.anomalies);

      if (sampleResults.anomalies.length > 0) {
        result.isValid = false;
      }

      return result;
    } catch (error) {
      logError(`Error verifying table ${table.name}`, error);
      throw error;
    }
  }

  private async getSqlCount(connection: Connection, table: string): Promise<number> {
    const result = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
    return parseInt(result[0].count);
  }

  private async verifySamples(
    sqlConnection: Connection,
    collection: any,
    table: any
  ): Promise<SampleVerificationResult> {
    const result: SampleVerificationResult = {
      verifiedCount: 0,
      anomalies: []
    };

    // Get sample of records from SQL
    const sqlSample = await sqlConnection.query(
      `SELECT * FROM ${table.name} ORDER BY RANDOM() LIMIT 1000`
    );

    for (const record of sqlSample) {
      const mongoRecord = await collection.findOne({ id: record.id });
      
      if (!mongoRecord) {
        result.anomalies.push({
          type: 'missing_record',
          description: `Record with ID ${record.id} not found in MongoDB`,
          severity: 'high',
          recordId: record.id
        });
        continue;
      }

      // Check for data anomalies using AI model
      const anomalies = await this.detectAnomalies(record, mongoRecord);
      result.anomalies.push(...anomalies);

      result.verifiedCount++;
    }

    return result;
  }

  private async detectAnomalies(
    sqlRecord: any,
    mongoRecord: any
  ): Promise<DataAnomaly[]> {
    const anomalies: DataAnomaly[] = [];

    try {
      // Convert records to feature vectors
      const features = this.extractFeatures(sqlRecord, mongoRecord);
      
      // Use autoencoder to detect anomalies
      const tensor = tf.tensor2d([features]);
      const prediction = this.anomalyModel.predict(tensor) as tf.Tensor;
      const reconstructionError = tf.metrics.meanSquaredError(tensor, prediction);
      
      const errorValue = await reconstructionError.data();
      
      // If reconstruction error is high, flag as anomaly
      if (errorValue[0] > 0.1) {
        anomalies.push({
          type: 'data_anomaly',
          description: 'Potential data corruption or transformation error detected',
          severity: 'medium',
          recordId: sqlRecord.id,
          confidence: 1 - errorValue[0]
        });
      }

      tensor.dispose();
      prediction.dispose();
      reconstructionError.dispose();
    } catch (error) {
      logError('Error detecting anomalies', error);
    }

    return anomalies;
  }

  private extractFeatures(sqlRecord: any, mongoRecord: any): number[] {
    // Convert record fields to numerical features
    const features: number[] = [];
    
    // Add basic statistical features
    features.push(
      Object.keys(sqlRecord).length,
      Object.keys(mongoRecord).length,
      this.calculateFieldSimilarity(sqlRecord, mongoRecord)
    );

    // Pad or truncate to fixed length
    return features.concat(new Array(61).fill(0)).slice(0, 64);
  }

  private calculateFieldSimilarity(record1: any, record2: any): number {
    const fields1 = new Set(Object.keys(record1));
    const fields2 = new Set(Object.keys(record2));
    
    const intersection = new Set([...fields1].filter(x => fields2.has(x)));
    const union = new Set([...fields1, ...fields2]);
    
    return intersection.size / union.size;
  }
}

interface VerificationResult {
  isValid: boolean;
  tables: TableVerificationResult[];
  anomalies: DataAnomaly[];
  totalRecords: number;
  verifiedRecords: number;
}

interface TableVerificationResult {
  tableName: string;
  isValid: boolean;
  totalRecords: number;
  verifiedRecords: number;
  anomalies: DataAnomaly[];
}

interface SampleVerificationResult {
  verifiedCount: number;
  anomalies: DataAnomaly[];
}

interface DataAnomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recordId?: string | number;
  confidence?: number;
}