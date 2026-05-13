// Referral Program API
import { NextRequest, NextResponse } from 'next/server';
import { 
  getReferralCode, 
  validateReferralCode, 
  getReferralRewardStatus,
  recordReferralConversion,
} from '@/lib/loyalty';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const customerId = searchParams.get('customerId');

  try {
    switch (action) {
      case 'code':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const referralData = await getReferralCode(customerId);
        return NextResponse.json({ referral: referralData });

      case 'validate':
        const code = searchParams.get('code');
        if (!code) {
          return NextResponse.json({ error: 'code required' }, { status: 400 });
        }
        const validation = await validateReferralCode(code);
        return NextResponse.json(validation);

      case 'status':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const status = await getReferralRewardStatus(customerId);
        return NextResponse.json(status);

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: code, validate, status' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'convert':
        // Record a referral conversion
        const conversion = await recordReferralConversion(
          body.referralCode,
          body.newCustomerId,
          body.jobId
        );
        return NextResponse.json({ success: true, conversion });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Referral POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}