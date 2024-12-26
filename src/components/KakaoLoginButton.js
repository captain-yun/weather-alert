'use client';

import { getKakaoAuthUrl } from '@/utils/kakaoAuth';

const KakaoLoginButton = () => {
  const handleLogin = () => {
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-yellow-300 text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
    >
      카카오톡으로 로그인
    </button>
  );
};

export default KakaoLoginButton; 