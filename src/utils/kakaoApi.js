const KAKAO_API_ENDPOINT = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';

export const sendKakaoMessage = async (accessToken, message) => {
  try {
    const response = await fetch(KAKAO_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      },
      body: new URLSearchParams({
        template_object: JSON.stringify({
          object_type: 'text',
          text: message,
          link: {
            web_url: process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:3000',
            mobile_web_url: process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:3000'
          }
        })
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || '카카오톡 메시지 전송에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('카카오톡 메시지 전송 실패:', error);
    throw error;
  }
};

export const refreshKakaoToken = async (refreshToken) => {
  try {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) throw new Error('토큰 갱신 실패');
    return await response.json();
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
}; 