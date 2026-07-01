import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prismaClientSingleton = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;
  
  const pool = new Pool({ 
    connectionString,
    max: 20, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 10000, 
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ 
    adapter,
    log: ['error'], 
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}