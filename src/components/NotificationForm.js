'use client';

import { useState, useEffect } from 'react';
import KakaoLoginButton from './KakaoLoginButton';

// 주요 도시 및 구 데이터
const CITIES = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '인천광역시': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구'],
  '대구광역시': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구'],
  '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
  '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
};

export default function NotificationForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationTime, setNotificationTime] = useState('0900');
  const [selectedCity, setSelectedCity] = useState('서울특별시');
  const [selectedDistrict, setSelectedDistrict] = useState(CITIES['서울특별시'][0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    const userData = JSON.parse(sessionStorage.getItem('user') || 'null');
    setIsLoggedIn(!!loggedIn);
    setUser(userData);
  }, []);

  useEffect(() => {
    setSelectedDistrict(CITIES[selectedCity][0]);
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          time: notificationTime,
          city: selectedCity,
          district: selectedDistrict,
        }),
      });

      if (!response.ok) {
        throw new Error('알림 설정에 실패했습니다.');
      }

      setMessage('알림이 성공적으로 설정되었습니다!');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 w-full max-w-md mx-auto transform transition-all hover:shadow-xl">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">날씨 알림 서비스</h2>
          <p className="text-gray-600">날씨 알림을 받으려면 로그인이 필요합니다.</p>
          <div className="pt-4">
            <KakaoLoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 w-full max-w-md mx-auto transform transition-all hover:shadow-xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">알림 설정</h2>
        <p className="text-gray-600 mt-2">원하시는 지역과 시간을 선택해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              시/도
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {Object.keys(CITIES).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              구/군
            </label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {CITIES[selectedCity].map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            알림 받을 시간
          </label>
          <select
            id="time"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0');
              return (
                <option key={hour} value={`${hour}00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              설정 중...
            </div>
          ) : (
            '알림 설정하기'
          )}
        </button>

        {message && (
          <div className={`p-4 rounded-lg transition-all duration-300 ${
            message.includes('실패') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${message.includes('실패') ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                {message.includes('실패') ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {message}
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 