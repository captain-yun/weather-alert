import { NextResponse } from 'next/server';
import { formatKakaoMessage } from '@/utils/weatherFormatter';
import { sendKakaoMessage } from '@/utils/kakaoApi';
import { MessageQueue } from '@/utils/messageQueue';

const messageQueue = new MessageQueue();

export async function POST(request) {
  try {
    // 요청에서 사용자 정보 추출
    const { accessToken, phoneNumber } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: '카카오톡 액세스 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    // 날씨 정보 가져오기
    const weatherResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVICE_URL}/api/weather`, {
      cache: 'no-store'
    });
    
    if (!weatherResponse.ok) {
      throw new Error('날씨 정보를 가져오는데 실패했습니다.');
    }

    const weatherData = await weatherResponse.json();
    
    // 카카오톡 메시지 포맷팅
    const message = formatKakaoMessage(weatherData);

    // 메시지 큐에 추가
    await messageQueue.addToQueue(accessToken, message);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('날씨 알림 발송 실패:', error);
    return NextResponse.json(
      { 
        error: '날씨 알림 발송에 실패했습니다.',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 