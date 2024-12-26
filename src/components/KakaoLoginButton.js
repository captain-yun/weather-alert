'use client';

import { getKakaoAuthUrl } from '@/utils/kakaoAuth';

const KakaoLoginButton = () => {
  const handleLogin = () => {
    console.log('로그인 버튼 클릭됨');
    
    try {
      console.log('getKakaoAuthUrl 호출 전');
      const authUrl = getKakaoAuthUrl();
      console.log('인증 URL 생성됨:', authUrl);
      
      if (!authUrl) {
        console.error('인증 URL이 생성되지 않음');
        return;
      }
      
      console.log('페이지 이동 시도:', authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error('카카오 로그인 처리 중 에러:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-yellow-300 text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
      aria-label="카카오톡으로 로그인"
    >
      카카오톡으로 로그인
    </button>
  );
};

export default KakaoLoginButton; 