import cron from 'node-cron';

let cronJob = null;

export const startNotificationScheduler = () => {
  if (cronJob) {
    console.log('스케줄러가 이미 실행 중입니다.');
    return;
  }

  // 매 분마다 실행
  cronJob = cron.schedule('* * * * *', async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVICE_URL}/api/notifications/send`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('알림 발송 요청 실패');
      }

      const result = await response.json();
      console.log('알림 발송 결과:', result);
    } catch (error) {
      console.error('알림 발송 중 오류 발생:', error);
    }
  });

  console.log('날씨 알림 스케줄러가 시작되었습니다.');
};

export const stopNotificationScheduler = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('날씨 알림 스케줄러가 중지되었습니다.');
  }
}; 