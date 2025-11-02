import { Pool } from 'pg';
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}
