'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getKakaoToken } from '@/utils/kakaoAuth';
import { prisma } from '@/lib/prisma';

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) throw new Error('Authorization code not found');

        // 액세스 토큰 요청 (client_secret 포함)
        const response = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXT_PUBLIC_SERVICE_URL}/auth/kakao/callback`,
            code,
          }),
        });

        if (!response.ok) throw new Error('Failed to get token');
        
        const tokenData = await response.json();
        
        // 토큰 저장
        localStorage.setItem('kakaoAccessToken', tokenData.access_token);
        
        // Prisma를 통해 Supabase DB에 사용자 정보 저장
        const user = await prisma.user.upsert({
          where: { accessToken: tokenData.access_token },
          update: {
            refreshToken: tokenData.refresh_token,
            tokenExpires: new Date(Date.now() + tokenData.expires_in * 1000),
            isActive: true
          },
          create: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpires: new Date(Date.now() + tokenData.expires_in * 1000),
            isActive: true
          }
        });

        router.push('/');
      } catch (error) {
        console.error('카카오 로그인 실패:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleKakaoCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">카카오톡 로그인 처리중...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 