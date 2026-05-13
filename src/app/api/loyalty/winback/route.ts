// Win-back Campaigns API
import { NextRequest, NextResponse } from 'next/server';
import { 
  findDormantCustomers, 
  triggerWinBackCampaign, 
  sendWinBackCampaigns,
} from '@/lib/loyalty';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const monthsThreshold = parseInt(searchParams.get('months') || '24');

  try {
    switch (action) {
      case 'dormant':
        // Find dormant customers
        const dormant = await findDormantCustomers(monthsThreshold);
        return NextResponse.json({ 
          count: dormant.length,
          customers: dormant,
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: dormant' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Winback API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'trigger':
        // Trigger win-back for a single customer
        if (!body.customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const result = await triggerWinBackCampaign(
          body.customerId,
          body.offerAmount || 50
        );
        return NextResponse.json(result);

      case 'send-all':
        // Send to all dormant customers
        const results = await sendWinBackCampaigns(body.offerAmount || 50);
        return NextResponse.json({
          success: true,
          ...results,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Winback POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}