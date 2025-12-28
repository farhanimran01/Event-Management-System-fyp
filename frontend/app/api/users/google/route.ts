import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { localStorage } from '@/lib/localStorage';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/users/google - Google authentication');

    const body = await req.json();
    const { email, name, picture, googleId } = body;

    console.log('[GOOGLE_AUTH] Processing Google login:', { email, name, googleId });

    let userResponse: any;
    let savedToMongo = false;

    // Try MongoDB first
    try {
      console.log('[DATABASE] Attempting MongoDB connection...');
      await connectDB();
      console.log('[DATABASE] Connected to MongoDB');

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        console.log('[GOOGLE_AUTH] User exists in MongoDB, updating Google ID');
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
      } else {
        console.log('[GOOGLE_AUTH] Creating new user in MongoDB from Google');
        user = await User.create({
          name,
          email,
          picture,
          googleId,
          role: 'user',
          verified: true,
          password: 'GOOGLE_AUTH',
        });
      }

      console.log('[GOOGLE_AUTH] User processed in MongoDB:', user._id);

      userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        googleId: user.googleId,
        verified: user.verified,
      };

      savedToMongo = true;
    } catch (dbError: any) {
      console.warn('[DATABASE] MongoDB unavailable, using local storage:', dbError.message);

      // Fallback to local storage
      try {
        let storedUser = localStorage.findUserByEmail(email);

        if (storedUser) {
          console.log('[GOOGLE_AUTH] User exists in local storage, updating Google ID');
          if (!storedUser.googleId) {
            const updated = localStorage.updateUser(storedUser._id, { googleId });
            if (updated) {
              storedUser = updated;
            }
          }
        } else {
          console.log('[GOOGLE_AUTH] Creating new user in local storage from Google');
          storedUser = localStorage.createUser({
            name,
            email,
            picture,
            googleId,
            role: 'user',
            verified: true,
          });
        }

        if (!storedUser) {
          throw new Error('Failed to process user in local storage');
        }

        console.log('[GOOGLE_AUTH] User processed in local storage:', storedUser._id);

        userResponse = {
          _id: storedUser._id,
          name: storedUser.name,
          email: storedUser.email,
          picture: storedUser.picture,
          role: storedUser.role,
          googleId: storedUser.googleId,
          verified: storedUser.verified,
        };
      } catch (storageError: any) {
        console.error('[STORAGE] Failed to process user:', storageError.message);
        return NextResponse.json(
          { error: storageError.message },
          { status: 500 }
        );
      }
    }

    const storage = savedToMongo ? 'MongoDB' : 'Local Storage';
    console.log(`✅ Google authentication successful (${storage}) - ${email}`);

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error: any) {
    console.error('[API] POST /api/users/google error:', error);
    return NextResponse.json(
      { error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
