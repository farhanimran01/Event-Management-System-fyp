import { NextRequest, NextResponse } from 'next/server';
import { localStorage } from '@/lib/localStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'export') {
      // Export all users as JSON
      const data = localStorage.exportUsers();
      return NextResponse.json({
        success: true,
        users: JSON.parse(data),
        count: JSON.parse(data).length,
      });
    }

    if (action === 'count') {
      // Get count of users
      const count = localStorage.getUserCount();
      return NextResponse.json({ count });
    }

    // Default: get all users
    const users = localStorage.getAllUsers();
    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        location: u.location,
        role: u.role,
        verified: u.verified,
        googleId: u.googleId ? 'linked' : null,
        createdAt: u.createdAt,
      })),
      total: users.length,
    });
  } catch (error: any) {
    console.error('GET /api/data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
