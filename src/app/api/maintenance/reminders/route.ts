// Maintenance Reminders API
// Triggers the reminder queue system
import { NextRequest, NextResponse } from 'next/server';
import { 
  queueServiceReminders, 
  processPendingNotifications,
  getEquipmentDueForService,
  checkEquipmentForUpsells,
} from '@/lib/maintenance';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const daysAhead = parseInt(searchParams.get('daysAhead') || '42');

  try {
    switch (action) {
      case 'due':
        // Get list of equipment due for service
        const dueEquipment = await getEquipmentDueForService(daysAhead);
        return NextResponse.json({ 
          count: dueEquipment.length,
          equipment: dueEquipment,
        });

      case 'upsells':
        // Get equipment that needs replacement recommendations
        const upsells = await checkEquipmentForUpsells();
        return NextResponse.json({ 
          count: upsells.length,
          upsells,
        });

      case 'pending':
        // Get pending notification count
        // TODO: implement pending count query
        return NextResponse.json({ 
          pending: 0,
          message: 'Connect to DB to get pending count',
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: due, upsells, pending' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'queue':
        // Queue all due reminders (called by cron job)
        const queued = await queueServiceReminders();
        return NextResponse.json({ 
          success: true,
          ...queued,
        });

      case 'process':
        // Process pending notifications (called by cron job)
        const processed = await processPendingNotifications();
        return NextResponse.json({ 
          success: true,
          ...processed,
        });

      case 'test-reminder':
        // Test reminder for a specific customer (development only)
        const testReminder = await queueServiceReminders();
        return NextResponse.json({ 
          success: true,
          message: 'Test reminder queued',
          ...testReminder,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reminders POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}