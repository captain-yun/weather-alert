'use client';

import { useState, useEffect } from 'react';
import KakaoLoginButton from './KakaoLoginButton';

const SubscriptionForm = ({ isSubscribed, setIsSubscribed }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kakaoAccessToken, setKakaoAccessToken] = useState(null);

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('kakaoAccessToken');
    setKakaoAccessToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!kakaoAccessToken) {
        throw new Error('카카오톡 로그인이 필요합니다.');
      }

      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: kakaoAccessToken,
          phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error('알림 신청에 실패했습니다.');
      }

      setIsSubscribed(true);
      setPhoneNumber('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!kakaoAccessToken) {
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          날씨 알림을 받으려면 카카오톡 로그인이 필요합니다.
        </p>
        <KakaoLoginButton />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="phoneNumber" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          카카오톡 알림을 받을 전화번호
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="010-0000-0000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || isSubscribed}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '처리중...' : isSubscribed ? '신청완료' : '알림 신청하기'}
      </button>
    </form>
  );
};

export default SubscriptionForm; 