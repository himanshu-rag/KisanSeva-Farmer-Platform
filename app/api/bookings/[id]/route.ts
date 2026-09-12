import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id: tokenId } = await context.params;
    const db = getDb();

    // Use the `tokens` table (actual table, not bookings)
    const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId) as any;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (token.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'Booking already cancelled' }, { status: 400 });
    }

    // Cancel the token
    db.prepare("UPDATE tokens SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?").run(tokenId);

    // Free the slot
    db.prepare("UPDATE slots SET booked = MAX(0, booked - 1) WHERE id = ?").run(token.slot_id);

    // Remove from queue
    db.prepare("DELETE FROM queue_entries WHERE token_id = ?").run(tokenId);

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
