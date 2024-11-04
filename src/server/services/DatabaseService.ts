import { createConnection, Connection, getConnection } from 'typeorm';
import { MongoClient, Db } from 'mongodb';
import { logInfo, logError } from '../../utils/logger';
import { DatabaseConfig } from '../../types/database';

export class DatabaseService {
  private static instance: DatabaseService;
  private sqlConnection: Connection | null = null;
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connectToSQL(config: DatabaseConfig): Promise<Connection> {
    try {
      if (this.sqlConnection?.isConnected) {
        return this.sqlConnection;
      }

      this.sqlConnection = await createConnection({
        type: config.type,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
      });

      logInfo('SQL database connected successfully', { database: config.database });
      return this.sqlConnection;
    } catch (error) {
      logError(error, { context: 'SQL Connection' });
      throw error;
    }
  }

  async connectToMongo(uri: string, dbName: string): Promise<Db> {
    try {
      if (!this.mongoClient) {
        this.mongoClient = new MongoClient(uri);
        await this.mongoClient.connect();
        this.mongoDb = this.mongoClient.db(dbName);
        logInfo('MongoDB connected successfully', { database: dbName });
      }
      return this.mongoDb;
    } catch (error) {
      logError(error, { context: 'MongoDB Connection' });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.sqlConnection?.isConnected) {
        await this.sqlConnection.close();
      }
      if (this.mongoClient) {
        await this.mongoClient.close();
      }
      logInfo('Database connections closed');
    } catch (error) {
      logError(error, { context: 'Database Disconnect' });
      throw error;
    }
  }
}