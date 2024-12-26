import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    const API_ENDPOINT = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

    // 시간 설정 (40분 전 기준)
    const now = new Date();
    const adjustedDate = new Date(now.getTime() - 40 * 60000);
    const baseDate = adjustedDate.toISOString().slice(0, 10).replace(/-/g, '');
    const baseTime = adjustedDate
      .getHours()
      .toString()
      .padStart(2, '0') + adjustedDate.getMinutes().toString().padStart(2, '0');

    const nx = 61; // 서울 강남구 x 좌표
    const ny = 126; // 서울 강남구 y 좌표

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

    // 데이터 매핑
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

    // 정상 응답 반환
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
