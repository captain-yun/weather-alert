'use client';

import { useState, useEffect } from 'react';
import { formatWebDisplay } from '@/utils/weatherFormatter';

const WeatherInfo = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        setWeather(formatWebDisplay(data));
      } catch (error) {
        console.error('날씨 정보를 가져오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse p-6 bg-gray-100 rounded-lg w-full max-w-md">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">현재 날씨</h2>
      {weather && (
        <div className="space-y-2">
          <p className="text-lg">기온: {weather.mainInfo.temperature}</p>
          <p className="text-lg">날씨: {weather.mainInfo.description}</p>
          <p className="text-sm text-gray-500">
            마지막 업데이트: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherInfo; 