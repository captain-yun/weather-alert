import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    // TODO: 실제 데이터베이스에 저장하는 로직 구현
    // 여기서는 간단한 검증만 수행
    if (!phoneNumber.match(/^010-\d{4}-\d{4}$/)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('알림 신청 처리 실패:', error);
    return NextResponse.json(
      { error: '알림 신청 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
} 