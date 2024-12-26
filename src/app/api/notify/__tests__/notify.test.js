import { POST } from '../route';
import { NextResponse } from 'next/server';
import { sendKakaoMessage } from '@/utils/kakaoApi';

// 모듈 모킹
jest.mock('@/utils/kakaoApi');

describe('알림 API 테스트', () => {
  beforeEach(() => {
    // fetch 모킹
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          temperature: 20,
          rainfall: 0,
          humidity: 50,
          windSpeed: 2,
          description: '맑음',
          timestamp: new Date().toISOString()
        })
      })
    );
  });

  it('정상적으로 알림을 발송해야 함', async () => {
    // sendKakaoMessage 모킹
    sendKakaoMessage.mockResolvedValueOnce({ result_code: 0 });

    const request = new Request('http://localhost:3000/api/notify', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: 'test_token',
        phoneNumber: '010-1234-5678'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({ success: true });
    expect(sendKakaoMessage).toHaveBeenCalled();
  });

  it('액세스 토큰이 없을 경우 에러를 반환해야 함', async () => {
    const request = new Request('http://localhost:3000/api/notify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '010-1234-5678'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: '카카오톡 액세스 토큰이 필요합니다.'
    });
  });
}); 