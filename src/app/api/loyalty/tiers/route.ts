// Loyalty Tiers API
import { NextRequest, NextResponse } from 'next/server';
import { 
  getCustomerLoyaltyTier, 
  getCustomerBenefits, 
  applyTierDiscount,
  getLoyaltyProgramStats,
  LOYALTY_TIERS,
} from '@/lib/loyalty';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const customerId = searchParams.get('customerId');

  try {
    switch (action) {
      case 'tiers':
        // Get all tier definitions
        return NextResponse.json({ tiers: LOYALTY_TIERS });

      case 'customer-tier':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const tier = await getCustomerLoyaltyTier(customerId);
        return NextResponse.json({ customerId, tier });

      case 'benefits':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const benefits = await getCustomerBenefits(customerId);
        return NextResponse.json(benefits);

      case 'stats':
        const stats = await getLoyaltyProgramStats();
        return NextResponse.json(stats);

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: tiers, customer-tier, benefits, stats' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Tiers API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'calculate-discount':
        // Calculate discount for a quote
        if (!body.customerId || !body.quoteAmount) {
          return NextResponse.json({ error: 'customerId and quoteAmount required' }, { status: 400 });
        }
        const discount = await applyTierDiscount(
          body.customerId,
          body.quoteAmount,
          body.serviceType || 'repair'
        );
        return NextResponse.json(discount);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tiers POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}