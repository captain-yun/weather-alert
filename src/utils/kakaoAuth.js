const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SERVICE_URL}/auth/kakao/callback`;

// 카카오 로그인 URL 생성
export const getKakaoAuthUrl = () => {

  console.log(process.env.NEXT_PUBLIC_KAKAO_API_KEY)  
  const params = {
    client_id: process.env.NEXT_PUBLIC_KAKAO_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'talk_message' // 메시지 전송 권한 요청
  };

  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${KAKAO_AUTH_URL}?${query}`;
};

// 액세스 토큰 요청
export const getKakaoToken = async (code) => {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_KAKAO_API_KEY,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
}; 