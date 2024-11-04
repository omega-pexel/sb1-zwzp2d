export interface Column {
  name: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
  default?: any;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Relationship {
  sourceTable: string;
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
  type: 'embed' | 'reference';
}

export interface Schema {
  tables: Table[];
  relationships: Relationship[];
}

export interface MongoField {
  name: string;
  type: string;
  required: boolean;
  default?: any;
}

export interface MongoIndex {
  key: Record<string, number>;
  unique?: boolean;
}

export interface MongoCollection {
  name: string;
  fields: MongoField[];
  indexes: MongoIndex[];
}

export interface MongoSchema {
  collections: MongoCollection[];
}