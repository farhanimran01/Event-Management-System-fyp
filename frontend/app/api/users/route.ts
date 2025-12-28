import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { localStorage } from '@/lib/localStorage';

export async function GET() {
  const startTime = Date.now();
  try {
    console.log('GET /api/users - Starting...');
    
    // Try MongoDB first
    try {
      await connectDB();
      console.log('Connected to MongoDB successfully');
      const users = await User.find().select('-password');
      const duration = Date.now() - startTime;
      console.log(`Retrieved ${users.length} users from MongoDB in ${duration}ms`);
      return NextResponse.json(users, { status: 200 });
    } catch (mongoError) {
      console.warn('MongoDB unavailable, using local storage:', (mongoError as any).message);
    }

    // Fallback to local storage
    const users = localStorage.getAllUsers();
    const duration = Date.now() - startTime;
    console.log(`Retrieved ${users.length} users from local storage in ${duration}ms`);
    
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('GET /api/users error:', error, `Duration: ${duration}ms`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    console.log('POST /api/users - User signup initiated');

    const body = await req.json();
    console.log('Request body:', { ...body, password: '***' });

    const { name, email, password, role, phone, location } = body;

    // Validation
    console.log(`Validating signup form for ${email}`);
    if (!name || !email || !password) {
      console.warn('Missing required fields');
      const duration = Date.now() - startTime;
      console.log(`Signup validation failed in ${duration}ms`);
      
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Try MongoDB first
    let userResponse: any;
    let savedToMongo = false;

    try {
      console.log('Attempting to save to MongoDB...');
      await connectDB();

      // Check if user exists in MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn('User already exists in MongoDB:', email);
        const duration = Date.now() - startTime;
        console.log(`Duplicate email check failed in ${duration}ms`);
        
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }

      // Create in MongoDB
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        phone: phone || '',
        location: location || '',
      });

      userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
      };

      savedToMongo = true;
      console.log('✅ User saved to MongoDB:', user._id);
    } catch (mongoError: any) {
      console.warn('MongoDB unavailable, using local storage:', mongoError.message);

      // Fallback to local storage
      try {
        // Check local storage
        const existingUser = localStorage.findUserByEmail(email);
        if (existingUser) {
          console.warn('User already exists in local storage:', email);
          const duration = Date.now() - startTime;
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 400 }
          );
        }

        // Create in local storage
        const storedUser = localStorage.createUser({
          name,
          email,
          password,
          role: role || 'user',
          phone: phone || '',
          location: location || '',
          verified: false,
        });

        userResponse = {
          _id: storedUser._id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
          phone: storedUser.phone,
          location: storedUser.location,
          createdAt: storedUser.createdAt,
        };

        console.log('✅ User saved to local storage:', storedUser._id);
      } catch (storageError: any) {
        console.error('Failed to save user:', storageError.message);
        return NextResponse.json(
          { error: storageError.message || 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    const duration = Date.now() - startTime;
    const storage = savedToMongo ? 'MongoDB' : 'Local Storage';
    console.log(`✅ User registration successful in ${storage} (${duration}ms) - Email: ${email}, ID: ${userResponse._id}`);

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('POST /api/users error:', error, `Duration: ${duration}ms`);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
