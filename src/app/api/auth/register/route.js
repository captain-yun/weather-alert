import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { kakaoId, accessToken, refreshToken, expiresIn } = body;

    if (!kakaoId || !accessToken) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    // Prisma를 사용하여 사용자 정보 저장
    const user = await prisma.user.upsert({
      where: { kakaoId: kakaoId },
      update: {
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + (expiresIn || 0) * 1000),
        isActive: true,
        updatedAt: now
      },
      create: {
        kakaoId,
        accessToken,
        refreshToken,
        tokenExpires: new Date(Date.now() + (expiresIn || 0) * 1000),
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        kakaoId: user.kakaoId,
        tokenExpires: user.tokenExpires,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('사용자 등록 실패:', error);
    return NextResponse.json(
      { error: '사용자 등록에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}