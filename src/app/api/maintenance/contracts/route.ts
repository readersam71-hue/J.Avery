// Maintenance Contracts API
import { NextRequest, NextResponse } from 'next/server';
import { 
  createMaintenanceContract, 
  renewContract, 
  cancelContract,
  getExpiringContracts,
  getCustomerActiveContract,
  getAllActiveContracts,
  getMaintenanceRevenueSummary,
  CONTRACT_PRICES,
} from '@/lib/maintenance';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const customerId = searchParams.get('customerId');
  const daysAhead = parseInt(searchParams.get('daysAhead') || '60');

  try {
    switch (action) {
      case 'expiring':
        const expiring = await getExpiringContracts(daysAhead);
        return NextResponse.json({ contracts: expiring });

      case 'by-customer':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const contract = await getCustomerActiveContract(customerId);
        return NextResponse.json({ contract });

      case 'active':
        const active = await getAllActiveContracts();
        return NextResponse.json({ contracts: active });

      case 'summary':
        const summary = await getMaintenanceRevenueSummary();
        return NextResponse.json(summary);

      case 'pricing':
        return NextResponse.json({ pricing: CONTRACT_PRICES });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: expiring, by-customer, active, summary, pricing' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Contracts API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'create':
        const newContract = await createMaintenanceContract({
          customerId: body.customerId,
          tier: body.tier,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          monthlyPrice: body.monthlyPrice || CONTRACT_PRICES[body.tier as keyof typeof CONTRACT_PRICES],
        });
        return NextResponse.json({ contract: newContract }, { status: 201 });

      case 'renew':
        if (!body.contractId || !body.newEndDate) {
          return NextResponse.json({ error: 'contractId and newEndDate required' }, { status: 400 });
        }
        const renewed = await renewContract(body.contractId, new Date(body.newEndDate), body.newMonthlyPrice);
        return NextResponse.json({ contract: renewed });

      case 'cancel':
        if (!body.contractId) {
          return NextResponse.json({ error: 'contractId required' }, { status: 400 });
        }
        await cancelContract(body.contractId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action. Use: create, renew, cancel' }, { status: 400 });
    }
  } catch (error) {
    console.error('Contracts POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}