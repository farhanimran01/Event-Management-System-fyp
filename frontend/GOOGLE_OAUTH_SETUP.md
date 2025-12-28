# Google OAuth Setup Guide

## Overview
Your Event Management System now has Google Login integrated! Users can sign in using their Google accounts.

## Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select an existing one
4. Navigate to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth 2.0 Client ID**
6. Choose **Web Application** as the application type
7. Fill in the form:
   - **Name**: Event Management System
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://yourdomain.com/api/auth/google/callback`
8. Click **Create**
9. Copy your **Client ID** (you'll need this in the next step)

### Step 2: Add Client ID to Environment Variables

1. Open `.env.local` in your project root
2. Find the line: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE`
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID
4. Save the file

Example:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### Step 3: Restart Development Server

1. Stop the dev server (Ctrl+C)
2. Run: `npm run dev`
3. The app will reload with Google OAuth enabled

## Current Status

✅ **Google OAuth Buttons Added**
- Login page: "Sign in with Google" button available
- Signup page: "Sign up with Google" button available

✅ **Backend Integration**
- New API endpoint: `/api/users/google`
- Handles Google token validation
- Automatic user creation from Google profile
- Falls back to demo mode if database unavailable

✅ **User Model Updated**
- Added `googleId` field for Google account linkage
- Added `picture` field for profile image
- Added `verified` field (auto-set to true for Google accounts)

## How It Works

### User Login Flow
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User grants permission
4. System receives Google tokens
5. System fetches user profile data from Google
6. User is automatically created/linked in database (or demo mode)
7. User is logged in and redirected to dashboard

### Features
- **Automatic Account Creation**: First-time Google users get accounts auto-created
- **Account Linking**: Existing users with same email are linked to Google
- **Demo Mode Fallback**: Works even if MongoDB is unavailable
- **Email Verification**: Google users are auto-verified (no email confirmation needed)
- **Profile Picture**: Google profile image stored in database

## Testing

### Test with Demo Mode (No Google Setup Required)
1. The app works without Google credentials
2. Google buttons won't appear if Client ID is missing
3. You can still test regular email/password login

### Test with Google Credentials
1. Add your Google Client ID to `.env.local`
2. Restart the dev server
3. Visit http://localhost:3000/login or /register
4. Click "Sign in with Google" or "Sign up with Google"
5. You should see Google's OAuth popup
6. After authentication, you'll be logged in to the dashboard

## Troubleshooting

### Google Buttons Not Appearing
- Check if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Make sure it's the correct Google Client ID
- Restart the dev server after updating .env.local

### "Redirect URI mismatch" Error
- Make sure your authorized redirect URIs in Google Cloud Console match exactly
- For localhost development: `http://localhost:3000` and `http://localhost:3000/api/auth/google/callback`
- Note: HTTPS required for production (use `https://yourdomain.com`)

### Users Not Being Saved
- This is normal if MongoDB is unavailable
- Demo mode will create temporary user sessions
- Once database is connected, users will be permanently saved

## Database Schema

The User model now includes:
```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (optional for Google auth),
  googleId: String (optional),
  picture: String (optional, Google profile picture),
  role: String (default: 'user'),
  verified: Boolean (true for Google users),
  phone: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. ✅ Add Google credentials (see Step 1-2 above)
2. Test Google login flow
3. Consider adding GitHub OAuth (similar setup)
4. Add profile picture display in dashboard
5. Add account linking UI for existing users

## Support

For issues with Google OAuth:
1. Check Google Cloud Console credentials are correct
2. Verify redirect URIs match exactly
3. Ensure Client ID is in `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
4. Check browser console for error messages
5. Check server logs (npm run dev output)
