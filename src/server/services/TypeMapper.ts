import { Column } from 'typeorm';
import { logInfo } from '../../utils/logger';
import { Schema, MongoSchema } from '../../types/schema';

export class TypeMapper {
  private typeMap: Record<string, string> = {
    // SQL to MongoDB type mappings
    'varchar': 'String',
    'text': 'String',
    'integer': 'Number',
    'bigint': 'Long',
    'decimal': 'Decimal128',
    'boolean': 'Boolean',
    'date': 'Date',
    'timestamp': 'Date',
    'json': 'Object',
    'jsonb': 'Object',
  };

  mapSchema(sqlSchema: Schema): MongoSchema {
    const collections = sqlSchema.tables.map(table => ({
      name: table.name,
      fields: table.columns.map(column => this.mapColumn(column)),
      indexes: this.generateIndexes(table),
    }));

    logInfo('Schema mapping completed', {
      collections: collections.length,
    });

    return { collections };
  }

  private mapColumn(column: Column): any {
    const mongoType = this.typeMap[column.type.toLowerCase()] || 'Mixed';
    
    return {
      name: column.name,
      type: mongoType,
      required: !column.isNullable,
      default: column.default,
    };
  }

  private generateIndexes(table: any): any[] {
    const indexes = [];

    // Add primary key index
    const primaryKey = table.columns.find(col => col.isPrimary);
    if (primaryKey) {
      indexes.push({
        key: { [primaryKey.name]: 1 },
        unique: true,
      });
    }

    // Add foreign key indexes
    table.foreignKeys?.forEach(fk => {
      indexes.push({
        key: { [fk.columns[0]]: 1 },
      });
    });

    return indexes;
  }
}