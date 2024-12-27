import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, time, city, district } = body;

    if (!userId || !time || !city || !district) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 기존 알림 설정이 있는지 확인
    const existingNotification = await prisma.notification.findFirst({
      where: { userId }
    });

    let notification;
    
    if (existingNotification) {
      // 기존 알림 설정 업데이트
      notification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          time,
          city,
          district,
          updatedAt: new Date()
        }
      });
    } else {
      // 새로운 알림 설정 생성
      notification = await prisma.notification.create({
        data: {
          userId,
          time,
          city,
          district,
          isActive: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      notification 
    });

  } catch (error) {
    console.error('알림 설정 실패:', error);
    return NextResponse.json(
      { error: '알림 설정에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
} 