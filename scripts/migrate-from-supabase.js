import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/lib/prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateData() {
  try {
    // Supabase에서 모든 사용자 데이터 가져오기
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    // Prisma를 사용하여 데이터 이전
    for (const user of users) {
      await prisma.user.create({
        data: {
          accessToken: user.access_token,
          refreshToken: user.refresh_token || '',
          tokenExpires: user.token_expires || new Date(),
          isActive: user.is_active || true,
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
        },
      });
    }

    console.log('데이터 마이그레이션 완료');
  } catch (error) {
    console.error('마이그레이션 에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData(); 