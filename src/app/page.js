'use client';

import { useState } from 'react';
import WeatherInfo from '@/components/WeatherInfo';
import SubscriptionForm from '@/components/SubscriptionForm';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-3xl font-bold mb-8">날씨 알리미</h1>
      
      <WeatherInfo />
      
      <div className="mt-8 w-full max-w-md">
        <SubscriptionForm 
          isSubscribed={isSubscribed} 
          setIsSubscribed={setIsSubscribed} 
        />
      </div>
      
      {isSubscribed && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          알림 신청이 완료되었습니다!
        </div>
      )}
    </div>
  );
}
