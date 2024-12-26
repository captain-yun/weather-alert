import { prisma } from '@/lib/prisma';
import { MessageQueue } from '@/utils/messageQueue';
import { formatKakaoMessage } from '@/utils/weatherFormatter';

const messageQueue = new MessageQueue();

export async function POST(req) {
  try {
    let skip = 0;
    const batchSize = 100; // 한 번에 100명씩 처리

    while (true) {
      // 사용자를 배치로 조회
      const users = await prisma.user.findMany({
        where: { 
          isActive: true,
          tokenExpires: { gt: new Date() }
        },
        skip: skip,
        take: batchSize
      });

      if (users.length === 0) break;

      // 날씨 정보는 배치마다 새로 조회하여 최신 정보 유지
      const weatherData = await getWeatherInfo();
      const message = formatKakaoMessage(weatherData);

      // 배치 단위로 메시지 큐에 추가
      for (const user of users) {
        await messageQueue.addToQueue(user.accessToken, message);
      }

      // 다음 배치로
      skip += batchSize;

      // 배치 사이에 잠시 대기하여 시스템 부하 분산
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('날씨 알림 발송 실패:', error);
    return new Response('Error', { status: 500 });
  }
} 