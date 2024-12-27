// 기상청 API 관련 상수
export const WEATHER_API_CONSTANTS = {
  BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
};

// 주요 도시 좌표 매핑
const CITY_COORDINATES = {
  '서울특별시': {
    '강남구': { nx: 61, ny: 126 },
    '강서구': { nx: 58, ny: 126 },
    '강동구': { nx: 62, ny: 126 },
    '강북구': { nx: 61, ny: 128 },
    '관악구': { nx: 59, ny: 125 },
    '광진구': { nx: 62, ny: 126 },
    '구로구': { nx: 58, ny: 125 },
    '금천구': { nx: 59, ny: 124 },
    '노원구': { nx: 61, ny: 129 },
    '도봉구': { nx: 61, ny: 129 },
    '동대문구': { nx: 61, ny: 127 },
    '동작구': { nx: 59, ny: 125 },
    '마포구': { nx: 59, ny: 127 },
    '서대문구': { nx: 59, ny: 127 },
    '서초구': { nx: 61, ny: 125 },
    '성동구': { nx: 61, ny: 127 },
    '성북구': { nx: 61, ny: 127 },
    '송파구': { nx: 62, ny: 126 },
    '양천구': { nx: 58, ny: 126 },
    '영등포구': { nx: 58, ny: 126 },
    '용산구': { nx: 60, ny: 126 },
    '은평구': { nx: 59, ny: 127 },
    '종로구': { nx: 60, ny: 127 },
    '중구': { nx: 60, ny: 127 },
    '중랑구': { nx: 62, ny: 127 }
  }
};

// 날씨 코드 매핑
export const WEATHER_CODES = {
  PTY: {
    0: '맑음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
    5: '빗방울',
    6: '빗방울/눈날림',
    7: '눈날림'
  }
};

// API 요청에 필요한 시간 포맷팅
export const getFormattedDateTime = () => {
  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const hours = now.getHours();
  const minutes = now.getMinutes();
  // API는 매 시간 45분에 업데이트되므로, 적절한 시간대 선택
  const baseTime = minutes < 45 
    ? `${(hours - 1).toString().padStart(2, '0')}30` 
    : `${hours.toString().padStart(2, '0')}30`;

  return { baseDate, baseTime };
};

// 날씨 데이터 파싱
export const parseWeatherData = (items) => {
  const weatherData = {
    temperature: null,
    rainfall: null,
    humidity: null,
    windSpeed: null,
    description: '맑음',
    timestamp: new Date()
  };

  items.forEach(item => {
    switch (item.category) {
      case 'T1H':
        weatherData.temperature = parseFloat(item.obsrValue);
        break;
      case 'RN1':
        weatherData.rainfall = parseFloat(item.obsrValue);
        break;
      case 'REH':
        weatherData.humidity = parseFloat(item.obsrValue);
        break;
      case 'WSD':
        weatherData.windSpeed = parseFloat(item.obsrValue);
        break;
      case 'PTY':
        weatherData.description = WEATHER_CODES.PTY[parseInt(item.obsrValue)] || '알 수 없음';
        break;
    }
  });

  return weatherData;
};

// 날씨 정보 조회
export const getWeatherData = async (city, district) => {
  if (!CITY_COORDINATES[city] || !CITY_COORDINATES[city][district]) {
    throw new Error('지원하지 않는 지역입니다.');
  }

  const { nx, ny } = CITY_COORDINATES[city][district];
  const { baseDate, baseTime } = getFormattedDateTime();

  const params = new URLSearchParams({
    serviceKey: process.env.WEATHER_API_KEY,
    pageNo: '1',
    numOfRows: '10',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: nx.toString(),
    ny: ny.toString()
  });

  try {
    const response = await fetch(`${WEATHER_API_CONSTANTS.BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error('날씨 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    
    if (!data.response?.body?.items?.item) {
      throw new Error('날씨 데이터 형식이 올바르지 않습니다.');
    }

    return parseWeatherData(data.response.body.items.item);
  } catch (error) {
    console.error('날씨 API 호출 중 오류:', error);
    throw error;
  }
}; 