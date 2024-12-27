import { sendKakaoMessage } from './kakaoApi';

// 메시지 큐 구현
export class MessageQueue {
  constructor() {
    // 사용자별 큐를 관리
    this.userQueues = new Map();
    this.processing = new Set();
  }

  // 메시지 추가
  async addToQueue(accessToken, message) {
    // 사용자별 큐가 없으면 생성
    if (!this.userQueues.has(accessToken)) {
      this.userQueues.set(accessToken, []);
    }

    // 해당 사용자의 큐에 메시지 추가
    this.userQueues.get(accessToken).push(message);

    // 해당 사용자의 큐가 처리 중이 아니면 처리 시작
    if (!this.processing.has(accessToken)) {
      await this.processUserQueue(accessToken);
    }
  }

  // 메시지 처리 (초당 5건 제한 준수)
  async processUserQueue(accessToken) {
    this.processing.add(accessToken);
    const queue = this.userQueues.get(accessToken);

    try {
      while (queue.length > 0) {
        // 한 번에 최대 5개까지 처리
        const batch = queue.splice(0, 5);
        await Promise.all(
          batch.map(message => sendKakaoMessage(accessToken, message))
        );

        // 다음 배치 전에 1초 대기 (사용자별 초당 5건 제한 준수)
        if (queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      this.processing.delete(accessToken);
      if (queue.length > 0) {
        // 남은 메시지가 있으면 다시 처리
        await this.processUserQueue(accessToken);
      }
    }
  }
} 