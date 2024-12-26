import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { kakaoId, accessToken, refreshToken, expiresIn } = await request.json();

    console.log(kakaoId)
    // expiresIn 값 검증 및 기본값 처리
    const expiresInSeconds = Number(expiresIn) || 0;

    // 사용자 데이터 생성 또는 업데이트
    const user = await prisma.user.upsert({
      where: { accessToken: accessToken },
      update: {
        refreshToken: refreshToken,
        tokenExpires: new Date(Date.now() + expiresInSeconds * 1000)
      },
      create: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpires: new Date(Date.now() + expiresInSeconds * 1000)
      }
    });

    // 성공 응답 반환
    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('사용자 등록 실패:', error);

    // 에러 응답 반환
    return NextResponse.json(
      { error: '사용자 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}


// export async function POST(request) {
//   try {
//     const { accessToken } = await request.json();

//     console.log(accessToken)
//     // 사용자 생성 또는 업데이트
//     const { data, error } = await supabase
//       .from('user')
//       .upsert(
//         {
//           access_token: accessToken,
//           updated_at: new Date().toISOString()
//         },
//         {
//           onConflict: 'access_token',
//           returning: true
//         }
//       );

//     if (error) throw error;

//     return NextResponse.json({ success: true, userId: data[0].id });
//   } catch (error) {
//     console.error('사용자 등록 실패:', error);
//     return NextResponse.json(
//       { error: '사용자 등록에 실패했습니다.' },
//       { status: 500 }
//     );
//   }
// }