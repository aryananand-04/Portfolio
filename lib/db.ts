import { Pool } from '@vercel/postgres';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool();
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}
