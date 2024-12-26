const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SERVICE_URL}/auth/kakao/callback`;

// 카카오 로그인 URL 생성
export const getKakaoAuthUrl = () => {
  // 환경변수 존재 여부 확인
  if (!process.env.NEXT_PUBLIC_KAKAO_API_KEY) {
    console.error('KAKAO_API_KEY가 설정되지 않음');
    return null;
  }
  
  if (!process.env.NEXT_PUBLIC_SERVICE_URL) {
    console.error('SERVICE_URL이 설정되지 않음');
    return null;
  }

  console.log('환경변수 확인:');
  console.log('KAKAO_API_KEY:', process.env.NEXT_PUBLIC_KAKAO_API_KEY);
  console.log('SERVICE_URL:', process.env.NEXT_PUBLIC_SERVICE_URL);
  console.log('REDIRECT_URI:', REDIRECT_URI);

  const params = {
    client_id: process.env.NEXT_PUBLIC_KAKAO_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'talk_message'
  };

  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const finalUrl = `${KAKAO_AUTH_URL}?${query}`;
  console.log('최종 인증 URL:', finalUrl);

  return finalUrl;
};

// 액세스 토큰 요청
export const getKakaoToken = async (code) => {
  console.log('토큰 요청 시작');
  console.log('인가 코드:', code);
  console.log('CLIENT_SECRET 존재 여부:', !!process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET);
  
  const tokenParams = {
    grant_type: 'authorization_code',
    client_id: process.env.NEXT_PUBLIC_KAKAO_API_KEY,
    client_secret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  };
  
  console.log('토큰 요청 파라미터:', tokenParams);

  try {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('토큰 요청 실패:', response.status, errorData);
      throw new Error(`Failed to get access token: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('토큰 요청 성공:', data);
    return data;
  } catch (error) {
    console.error('토큰 요청 중 에러:', error);
    throw error;
  }
}; 