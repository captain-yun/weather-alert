'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getKakaoToken, getKakaoUserInfo } from '@/utils/kakaoAuth';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) throw new Error('인가 코드가 없습니다.');

        // 카카오 토큰 받기
        const tokenResponse = await getKakaoToken(code);
        if (!tokenResponse.access_token) {
          throw new Error('액세스 토큰을 받지 못했습니다.');
        }

        // 카카오 사용자 정보 받기
        const userInfo = await getKakaoUserInfo(tokenResponse.access_token);
        if (!userInfo.id) {
          throw new Error('사용자 정보를 받지 못했습니다.');
        }

        console.log('사용자 정보 = ' + userInfo.id);
        // 서버에 사용자 등록
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kakaoId: String(userInfo.id),
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresIn: tokenResponse.expires_in
          }),
        });

        console.log('registerResponse = ' + registerResponse);
        
        if (!registerResponse.ok) {
          throw new Error('사용자 등록에 실패했습니다.');
        }

        const userData = await registerResponse.json();
        
        // 세션 스토리지에 사용자 정보 저장
        sessionStorage.setItem('user', JSON.stringify(userData.user));
        sessionStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('kakaoAccessToken', tokenResponse.access_token);
        
        // 알림 설정 페이지로 이동
        router.replace('/notification');

      } catch (error) {
        console.error('카카오 로그인 처리 중 에러:', error);
        router.replace('/login?error=' + encodeURIComponent(error.message));
      }
    };

    processKakaoLogin();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}