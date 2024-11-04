import { describe, it, expect } from 'vitest';
import { TypeMapper } from '../server/services/TypeMapper';
import { Schema, MongoSchema } from '../types/schema';

describe('TypeMapper', () => {
  const typeMapper = new TypeMapper();

  it('maps SQL types to MongoDB types correctly', () => {
    const sqlSchema: Schema = {
      tables: [{
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isNullable: false
          },
          {
            name: 'name',
            type: 'varchar',
            isPrimary: false,
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isPrimary: false,
            isNullable: true
          }
        ]
      }],
      relationships: []
    };

    const mongoSchema = typeMapper.mapSchema(sqlSchema);

    expect(mongoSchema.collections[0].fields).toEqual([
      {
        name: 'id',
        type: 'Number',
        required: true,
        default: undefined
      },
      {
        name: 'name',
        type: 'String',
        required: true,
        default: undefined
      },
      {
        name: 'created_at',
        type: 'Date',
        required: false,
        default: undefined
      }
    ]);
  });

  it('generates correct indexes', () => {
    const sqlSchema: Schema = {
      tables: [{
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isNullable: false
          }
        ]
      }],
      relationships: []
    };

    const mongoSchema = typeMapper.mapSchema(sqlSchema);

    expect(mongoSchema.collections[0].indexes).toEqual([
      {
        key: { id: 1 },
        unique: true
      }
    ]);
  });
});