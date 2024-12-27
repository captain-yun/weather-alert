import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { kakaoId, accessToken, refreshToken, expiresIn } = body;
    
    console.log('받은 요청 데이터:', {
      kakaoId,
      accessToken: accessToken ? '존재함' : '없음',
      refreshToken: refreshToken ? '존재함' : '없음',
      expiresIn
    });

    if (!kakaoId || !accessToken) {
      console.log('필수 데이터 누락:', { kakaoId: !!kakaoId, accessToken: !!accessToken });
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    console.log('현재 시간:', now);
    console.log('토큰 만료 시간 계산:', new Date(Date.now() + (expiresIn || 0) * 1000));
    
    // Prisma를 사용하여 사용자 정보 저장
    console.log('Prisma upsert 시도 중...');
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
    }).catch(error => {
      console.error('Prisma 작업 중 상세 에러:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      throw error;
    });

    console.log('사용자 정보 저장 성공:', {
      userId: user.id,
      kakaoId: user.kakaoId,
      isActive: user.isActive
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
    console.error('사용자 등록 실패 상세 정보:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return NextResponse.json(
      { error: '사용자 등록에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}