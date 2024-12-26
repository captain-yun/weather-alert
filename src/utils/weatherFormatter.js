export const WEATHER_EMOJI = {
  '맑음': '☀️',
  '비': '🌧️',
  '비/눈': '🌨️',
  '눈': '❄️',
  '소나기': '🌦️',
  '빗방울': '💧',
  '빗방울/눈날림': '🌨️',
  '눈날림': '🌨️'
};

// 체감온도 계산
export const calculateWindChill = (temp, windSpeed) => {
  if (temp <= 10 && windSpeed > 1.3) {
    return 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
  }
  return temp;
};

// 외출 추천 메시지
export const getOutdoorRecommendation = (temp, weather, windSpeed) => {
  if (weather !== '맑음') return '우산을 챙기세요! 🌂';
  if (temp < 5) return '따뜻하게 입으세요! 🧤';
  if (windSpeed > 5) return '바람이 강해요! 🌬️';
  if (temp > 28) return '더위 조심하세요! 🌡️';
  return '좋은 날씨예요! 🎵';
};

// 카카오톡 메시지 포맷
export const formatKakaoMessage = (weatherData) => {
  const windChill = calculateWindChill(weatherData.temperature, weatherData.windSpeed);
  
  return `[오늘의 날씨 알림] ${WEATHER_EMOJI[weatherData.description]}

🌡️ 현재 기온: ${weatherData.temperature}°C
(체감온도: ${windChill.toFixed(1)}°C)

${weatherData.description} ${WEATHER_EMOJI[weatherData.description]}
습도: ${weatherData.humidity}%
바람: ${weatherData.windSpeed}m/s

${getOutdoorRecommendation(weatherData.temperature, weatherData.description, weatherData.windSpeed)}

${new Date(weatherData.timestamp).toLocaleTimeString('ko-KR')} 기준`;
};

// 웹 표시용 포맷 (예시)
export const formatWebDisplay = (weatherData) => {
  return {
    mainInfo: {
      temperature: `${weatherData.temperature}°C`,
      description: weatherData.description,
      emoji: WEATHER_EMOJI[weatherData.description]
    },
    details: {
      windChill: calculateWindChill(weatherData.temperature, weatherData.windSpeed).toFixed(1),
      humidity: `${weatherData.humidity}%`,
      windSpeed: `${weatherData.windSpeed}m/s`
    },
    recommendation: getOutdoorRecommendation(
      weatherData.temperature, 
      weatherData.description, 
      weatherData.windSpeed
    ),
    timestamp: new Date(weatherData.timestamp).toLocaleTimeString('ko-KR')
  };
}; 