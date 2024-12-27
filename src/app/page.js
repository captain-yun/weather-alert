'use client';

import WeatherInfo from '@/components/WeatherInfo';
import NotificationForm from '@/components/NotificationForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-3xl font-bold mb-8">날씨 알리미</h1>
      
      {/* <WeatherInfo /> */}
      
      <div className="mt-8 w-full max-w-md">
        <NotificationForm />
      </div>
    </div>
  );
}
