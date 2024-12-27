import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // request.json()은 한 번만 호출해야 합니다
    const body = await request.json();
    const { kakaoId, accessToken, refreshToken, expiresIn } = body;

    console.log("kakaoId:", kakaoId);
    const expiresInSeconds = Number(expiresIn) || 0;

    const user = await prisma.user.upsert({
      where: { 
        kakaoId: kakaoId  // accessToken보다 kakaoId로 식별하는 것이 더 안정적입니다
      },
      update: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpires: new Date(Date.now() + expiresInSeconds * 1000)
      },
      create: {
        kakaoId: kakaoId,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpires: new Date(Date.now() + expiresInSeconds * 1000)
      }
    });

    // Response를 한 번만 생성합니다
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        kakaoId: user.kakaoId,
        tokenExpires: user.tokenExpires
      }
    });

  } catch (error) {
    console.error('사용자 등록 실패:', error);
    return NextResponse.json(
      { error: '사용자 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}