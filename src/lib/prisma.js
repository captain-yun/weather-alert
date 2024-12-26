import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // 개발 환경에서 핫 리로딩으로 인한 여러 인스턴스 생성 방지
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma }; 