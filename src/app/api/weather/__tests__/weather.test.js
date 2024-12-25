import { GET } from '../route';
import { NextResponse } from 'next/server';

// 환경변수 모킹
process.env.WEATHER_API_KEY = 'test_api_key';

// fetch 모킹
global.fetch = jest.fn();

describe('Weather API', () => {
  beforeEach(() => {
    // 각 테스트 전에 fetch 모킹 초기화
    fetch.mockClear();
  });

  it('성공적으로 날씨 데이터를 반환해야 함', async () => {
    // API 응답 모킹
    const mockApiResponse = {
      response: {
        header: {
          resultCode: '00',
          resultMsg: 'SUCCESS'
        },
        body: {
          items: {
            item: [
              { category: 'T1H', obsrValue: '25.0' },
              { category: 'RN1', obsrValue: '0.0' },
              { category: 'REH', obsrValue: '60.0' },
              { category: 'WSD', obsrValue: '2.0' },
              { category: 'PTY', obsrValue: '0' }
            ]
          }
        }
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const response = await GET();
    const data = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({
      temperature: 25.0,
      rainfall: 0.0,
      humidity: 60.0,
      windSpeed: 2.0,
      description: '맑음'
    });
  });

  it('API 요청 실패시 에러를 반환해야 함', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: '날씨 정보를 가져오는데 실패했습니다.'
    });
  });

  it('잘못된 API 응답 코드에 대해 에러를 반환해야 함', async () => {
    const mockErrorResponse = {
      response: {
        header: {
          resultCode: '03',
          resultMsg: 'NO_DATA'
        }
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: '날씨 정보를 가져오는데 실패했습니다.'
    });
  });
}); 