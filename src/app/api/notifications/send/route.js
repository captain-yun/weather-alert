import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWeatherData } from '@/utils/weatherApi';
import { formatKakaoMessage } from '@/utils/weatherFormatter';
import { sendKakaoMessage, refreshKakaoToken } from '@/utils/kakaoApi';
import { MessageQueue } from '@/utils/messageQueue';

const messageQueue = new MessageQueue();

export async function GET() {
  try {
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${currentHour}${currentMinute}`;

    console.log('현재 시간:', timeString);
    // 현재 시간에 알림을 받기로 한 사용자들 조회
    const notifications = await prisma.notification.findMany({
      where: {
        time: timeString,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    const results = [];

    for (const notification of notifications) {
      try {
        // 날씨 정보 조회
        const weatherData = await getWeatherData(notification.city, notification.district);
        const message = formatKakaoMessage(weatherData);

        // 토큰 만료 확인
        const user = notification.user;
        if (new Date(user.tokenExpires) <= new Date()) {
          // 토큰 갱신
          const refreshResult = await refreshKakaoToken(user.refreshToken);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              accessToken: refreshResult.access_token,
              tokenExpires: new Date(Date.now() + refreshResult.expires_in * 1000),
              refreshToken: refreshResult.refresh_token || user.refreshToken,
            },
          });
          user.accessToken = refreshResult.access_token;
        }

        // 메시지 큐에 추가
        await messageQueue.addToQueue(user.accessToken, message);
        
        results.push({
          userId: user.id,
          status: 'success',
          message: '알림이 성공적으로 전송되었습니다.',
        });
      } catch (error) {
        console.error(`사용자 ${notification.userId}에 대한 알림 처리 실패:`, error);
        results.push({
          userId: notification.userId,
          status: 'error',
          message: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('날씨 알림 처리 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 