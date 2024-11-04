export interface DatabaseConfig {
  type: 'mysql' | 'postgres' | 'mariadb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}