import { NextResponse } from 'next/server';
import { 
  WEATHER_API_CONSTANTS, 
  getFormattedDateTime, 
  parseWeatherData 
} from '@/utils/weatherApi';

export async function GET() {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    const { baseDate, baseTime } = getFormattedDateTime();
    const url = new URL(WEATHER_API_CONSTANTS.BASE_URL);
    
    // API 파라미터 설정
    const params = {
      serviceKey: API_KEY,
      numOfRows: '10',
      pageNo: '1',
      base_date: baseDate,
      base_time: baseTime,
      nx: WEATHER_API_CONSTANTS.NX,
      ny: WEATHER_API_CONSTANTS.NY,
      dataType: 'JSON'
    };

    // URL에 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    // API 응답 검증
    if (data.response?.header?.resultCode !== '00') {
      throw new Error(data.response?.header?.resultMsg || '알 수 없는 오류가 발생했습니다.');
    }

    const items = data.response?.body?.items?.item;
    if (!items || !Array.isArray(items)) {
      throw new Error('날씨 데이터 형식이 올바르지 않습니다.');
    }

    // 날씨 데이터 파싱 및 반환
    const weatherData = parseWeatherData(items);
    
    return NextResponse.json({
      ...weatherData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('날씨 정보 조회 실패:', error);
    return NextResponse.json(
      { 
        error: '날씨 정보를 가져오는데 실패했습니다.',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 