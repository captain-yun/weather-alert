import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    const API_ENDPOINT = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
    
    console.log(API_KEY);

    // 현재 시간 기준으로 날씨 정보 요청
    const now = new Date();
    const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    
    // API 요청 시간을 30분 단위로 조정
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const baseTime = `${hour.toString().padStart(2, '0')}${minutes < 30 ? '00' : '30'}`;

    // 서울 강남구 좌표 (예시)
    const nx = 61;
    const ny = 126;

    const url = new URL(API_ENDPOINT);
    url.searchParams.append('serviceKey', API_KEY);
    url.searchParams.append('numOfRows', '10');
    url.searchParams.append('pageNo', '1');
    url.searchParams.append('base_date', baseDate);
    url.searchParams.append('base_time', baseTime);
    url.searchParams.append('nx', nx);
    url.searchParams.append('ny', ny);
    url.searchParams.append('dataType', 'JSON');

    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 } // 30분마다 재검증
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data.response.header.resultCode !== '00') {
      throw new Error(data.response.header.resultMsg);
    }

    // 날씨 데이터 파싱
    const items = data.response.body.items.item;
    const weatherData = {
      temperature: null,  // 기온
      rainfall: null,     // 강수량
      humidity: null,     // 습도
      windSpeed: null,    // 풍속
      description: null   // 날씨 설명
    };

    // 각 카테고리별 데이터 매핑
    items.forEach(item => {
      switch (item.category) {
        case 'T1H': // 기온
          weatherData.temperature = parseFloat(item.obsrValue);
          break;
        case 'RN1': // 1시간 강수량
          weatherData.rainfall = parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          weatherData.humidity = parseFloat(item.obsrValue);
          break;
        case 'WSD': // 풍속
          weatherData.windSpeed = parseFloat(item.obsrValue);
          break;
        case 'PTY': // 강수형태
          weatherData.description = getWeatherDescription(parseInt(item.obsrValue));
          break;
      }
    });

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// 강수형태 코드를 설명으로 변환하는 함수
function getWeatherDescription(ptyCode) {
  const weatherCodes = {
    0: '맑음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
    5: '빗방울',
    6: '빗방울/눈날림',
    7: '눈날림'
  };
  return weatherCodes[ptyCode] || '알 수 없음';
} 