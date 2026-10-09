import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

export type Db = PrismaClient;

export function createDb(databaseUrl: string): Db {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

/** Phần tối thiểu của Db mà pingDb cần (để test truyền DB giả dễ dàng). */
export type Pingable = Pick<Db, '$queryRaw'>;

/** Truy vấn nhẹ `SELECT 1` để biết CSDL còn sống; không bao giờ ném lỗi. */
export async function pingDb(db: Pingable, timeoutMs = 2000): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('db ping timeout')), timeoutMs);
    });
    await Promise.race([db.$queryRaw`SELECT 1`, timeout]);
    return true;
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
