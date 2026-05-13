// Maintenance API - Equipment and Contract Management
// GET /api/maintenance/equipment - List equipment
// POST /api/maintenance/equipment - Register new equipment
// POST /api/maintenance/equipment/:id/service - Record service
// GET /api/maintenance/contracts - List contracts
// POST /api/maintenance/contracts - Create contract
// POST /api/maintenance/reminders/queue - Trigger reminder queue

import { NextRequest, NextResponse } from 'next/server';
import { 
  registerEquipment, 
  getEquipmentDueForService, 
  getCustomerEquipment,
  recordEquipmentService,
  calculateEquipmentAgeAndLifespan,
  createMaintenanceContract,
  getExpiringContracts,
  getCustomerActiveContract,
  getMaintenanceRevenueSummary,
  queueServiceReminders,
  getEquipmentAgingReport,
} from '@/lib/maintenance';

// ============================================
// EQUIPMENT ENDPOINTS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const customerId = searchParams.get('customerId');
  const daysAhead = parseInt(searchParams.get('daysAhead') || '42');

  try {
    switch (action) {
      case 'due':
        // Get equipment due for service
        const dueEquipment = await getEquipmentDueForService(daysAhead);
        return NextResponse.json({ equipment: dueEquipment });

      case 'aging-report':
        // Get equipment aging report
        const report = await getEquipmentAgingReport();
        return NextResponse.json({ report });

      case 'by-customer':
        if (!customerId) {
          return NextResponse.json({ error: 'customerId required' }, { status: 400 });
        }
        const customerEquipment = await getCustomerEquipment(customerId);
        return NextResponse.json({ equipment: customerEquipment });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: due, aging-report, by-customer' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Equipment API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'register':
        // Register new equipment
        const newEquipment = await registerEquipment({
          customerId: body.customerId,
          installedJobId: body.installedJobId,
          type: body.type,
          make: body.make,
          model: body.model,
          serialNumber: body.serialNumber,
          installationDate: new Date(body.installationDate),
          warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        });
        return NextResponse.json({ equipment: newEquipment }, { status: 201 });

      case 'service':
        // Record equipment service
        const updatedEquipment = await recordEquipmentService(
          body.equipmentId,
          body.serviceDate ? new Date(body.serviceDate) : new Date()
        );
        return NextResponse.json({ result: updatedEquipment });

      case 'age-info':
        // Calculate equipment age and lifespan info
        const ageInfo = calculateEquipmentAgeAndLifespan(
          new Date(body.installationDate),
          body.typicalLifespanYears || 15
        );
        return NextResponse.json(ageInfo);

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: register, service, age-info' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Equipment POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}