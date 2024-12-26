import { GET } from '../route';
import { NextResponse } from 'next/server';
import { 
  WEATHER_API_CONSTANTS, 
  getFormattedDateTime 
} from '@/utils/weatherApi';

// 환경변수 모킹
process.env.WEATHER_API_KEY = "SQ02ruRh103PHMc50vzLHOkoNvckdCgBQWFpKymXsyadvEqJU3IMsevEC1wHUslTqdfJRKaKOv4YPAmqKau2JA==";

// fetch 모킹
global.fetch = jest.fn();

describe('날씨 API 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 fetch 모킹 초기화
    fetch.mockClear();
    
    // Date 모킹
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-20T09:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('정상적인 날씨 데이터를 반환해야 함', async () => {
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
              { category: 'T1H', obsrValue: '25.0' },  // 기온
              { category: 'RN1', obsrValue: '0.0' },   // 강수량
              { category: 'REH', obsrValue: '60.0' },  // 습도
              { category: 'WSD', obsrValue: '2.0' },   // 풍속
              { category: 'PTY', obsrValue: '0' }      // 강수형태
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

    // URL 파라미터 검증
    const { baseDate, baseTime } = getFormattedDateTime();
    const expectedUrl = new URL(WEATHER_API_CONSTANTS.BASE_URL);
    const expectedParams = {
      serviceKey: 'test_api_key',
      numOfRows: '10',
      pageNo: '1',
      base_date: baseDate,
      base_time: baseTime,
      nx: WEATHER_API_CONSTANTS.NX.toString(),
      ny: WEATHER_API_CONSTANTS.NY.toString(),
      dataType: 'JSON'
    };

    const lastCallUrl = new URL(fetch.mock.calls[0][0]);
    Object.entries(expectedParams).forEach(([key, value]) => {
      expect(lastCallUrl.searchParams.get(key)).toBe(value);
    });

    // 응답 데이터 검증
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual({
      temperature: 25.0,
      rainfall: 0.0,
      humidity: 60.0,
      windSpeed: 2.0,
      description: '맑음',
      timestamp: expect.any(String)
    });
  });

  it('API 키가 없을 경우 에러를 반환해야 함', async () => {
    delete process.env.WEATHER_API_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: '날씨 정보를 가져오는데 실패했습니다.',
      message: 'API 키가 설정되지 않았습니다.'
    });

    // 환경변수 복구
    process.env.WEATHER_API_KEY = 'test_api_key';
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
      error: '날씨 정보를 가져오는데 실패했습니다.',
      message: 'API 요청 실패: 500'
    });
  });

  it('잘못된 API 응답 형식에 대해 에러를 반환해야 함', async () => {
    const mockErrorResponse = {
      response: {
        header: {
          resultCode: '03',
          resultMsg: '데이터 없음'
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
      error: '날씨 정보를 가져오는데 실패했습니다.',
      message: '데이터 없음'
    });
  });
}); 