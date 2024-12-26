import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { accessToken } = await request.json();

    // 사용자 생성 또는 업데이트
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          access_token: accessToken,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'access_token',
          returning: true
        }
      );

    if (error) throw error;

    return NextResponse.json({ success: true, userId: data[0].id });
  } catch (error) {
    console.error('사용자 등록 실패:', error);
    return NextResponse.json(
      { error: '사용자 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}