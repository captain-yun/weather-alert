'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getKakaoToken } from '@/utils/kakaoAuth';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    const processKakaoLogin = async () => {
      try {
        console.log('인가 코드:', code);
        const tokenResponse = await getKakaoToken(code);
        console.log('토큰 응답:', tokenResponse);
        
        // 토큰을 받은 후 서버에 사용자 등록
        if (tokenResponse.access_token) {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              kakaoId: tokenResponse.id,
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
              expiresIn: Number(tokenResponse.expires_in) || 0
            }),
          });

          console.log('사용자 등록 완료 : ' + response);

          if (!response.ok) {
            throw new Error('Failed to register user');
          }

          router.push('/subscription'); // 구독 설정 페이지로 이동
        }
      } catch (error) {
        console.error('카카오 로그인 처리 중 에러:', error);
        router.push('/login?error=auth_failed');
      }
    };

    if (code) {
      processKakaoLogin();
    }
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>카카오 로그인 처리 중...</p>
    </div>
  );
} 