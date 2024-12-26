'use client';

import { useState } from 'react';
import KakaoLoginButton from '@/components/KakaoLoginButton';

export default function TestPage() {
  const [result, setResult] = useState('');

  const handleTestMessage = async () => {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: localStorage.getItem('kakaoAccessToken'),
        }),
      });

      const data = await response.json();
      setResult(data.success ? '메시지 발송 성공!' : '메시지 발송 실패');
    } catch (error) {
      setResult('에러 발생: ' + error.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">카카오톡 메시지 테스트</h1>
      <div className="space-y-4">
        <KakaoLoginButton />
        <button
          onClick={handleTestMessage}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          테스트 메시지 보내기
        </button>
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}