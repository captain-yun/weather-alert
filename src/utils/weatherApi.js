// 기상청 API 관련 상수
export const WEATHER_API_CONSTANTS = {
  BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst',
  // 서울 강남구 좌표
  NX: 61,
  NY: 126
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
    description: '맑음'
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