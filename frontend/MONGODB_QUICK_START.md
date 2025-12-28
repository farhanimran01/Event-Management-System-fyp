# MongoDB Setup Complete! ✅

## What Has Been Installed

### Dependencies
- ✅ **mongoose** - MongoDB ODM for Node.js
- ✅ **dotenv** - Environment variable management

### Database Models
1. **User** - User account management
2. **Event** - Event information and management
3. **Ticket** - Ticket tracking and validation
4. **Registration** - Event registration records

### API Routes
- ✅ `/api/users` - User management (GET, POST)
- ✅ `/api/users/[id]` - Individual user operations (GET, PUT, DELETE)
- ✅ `/api/events` - Event management (GET, POST)
- ✅ `/api/events/[id]` - Individual event operations (GET, PUT, DELETE)
- ✅ `/api/tickets` - Ticket management (GET, POST)
- ✅ `/api/registrations` - Registration management (GET, POST)
- ✅ `/api/health` - Health check endpoint

## Quick Start

### 1. Install MongoDB Locally (Windows)

```bash
# Download from: https://www.mongodb.com/try/download/community
# Run installer and follow the setup wizard
# MongoDB will start automatically as a Windows Service
```

Verify installation:
```bash
mongosh
# You should see: "test>"
```

### 2. Verify Environment Configuration

Check `.env.local` file exists with:
```
MONGODB_URI=mongodb://localhost:27017/event-management
NODE_ENV=development
```

### 3. Test MongoDB Connection

Start the dev server:
```bash
npm run dev
```

Visit: http://localhost:3000/api/health

You should see:
```json
{
  "success": true,
  "message": "MongoDB connection successful!",
  "timestamp": "2024-11-30T..."
}
```

### 4. Test API Endpoints

#### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "phone": "+1234567890"
  }'
```

#### Get All Users
```bash
curl http://localhost:3000/api/users
```

#### Create an Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual tech conference",
    "date": "2024-12-15T00:00:00Z",
    "time": "09:00 AM",
    "location": "New York",
    "category": "Technology",
    "organizer": "Tech Organization",
    "capacity": 500,
    "ticketTypes": [
      {"name": "Standard", "price": 50, "quantity": 300},
      {"name": "VIP", "price": 100, "quantity": 100}
    ]
  }'
```

#### Get All Events
```bash
curl http://localhost:3000/api/events
```

## Project Structure

```
d:\FYP-Frontend\event\
├── lib/
│   └── mongodb.ts              # MongoDB connection configuration
├── models/
│   ├── User.ts                 # User schema and interface
│   ├── Event.ts                # Event schema and interface
│   ├── Ticket.ts               # Ticket schema and interface
│   └── Registration.ts         # Registration schema and interface
├── app/
│   └── api/
│       ├── users/              # User API routes
│       ├── events/             # Event API routes
│       ├── tickets/            # Ticket API routes
│       ├── registrations/      # Registration API routes
│       └── health/             # Health check endpoint
├── .env.local                  # Environment variables (local)
├── .env.example                # Environment template
└── MONGODB_SETUP.md            # Detailed setup guide
```

## Next Steps

### 1. Integrate with Frontend Components
Update your components to call these API endpoints:

```typescript
// Example in a React component
const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  return data;
};
```

### 2. Add Authentication
Consider adding JWT authentication to protect API routes:

```bash
npm install jsonwebtoken
```

### 3. Add More Middleware
- Request validation
- Error handling
- CORS configuration

### 4. Database Indexing
Add indexes to frequently queried fields:

```typescript
// In Event.ts schema
eventSchema.index({ date: 1, status: 1 });
userSchema.index({ email: 1 });
```

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
# Windows: 
# Check Services app for "MongoDB Server" and restart it

# Or in PowerShell (as Admin):
net start MongoDB
```

### Database Already Exists
This is normal. MongoDB will reuse existing databases with the same name.

### Port 27017 Already in Use
Change the MongoDB URI in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27018/event-management
```

## Production Deployment

For production, use MongoDB Atlas (cloud):

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` or environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
```

## Documentation Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Commands Reference

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Check linting
npm run lint

# View MongoDB data
mongosh
  use event-management
  db.users.find()
  db.events.find()
```

---

**MongoDB setup is complete! You can now use MongoDB with your Event Management System. 🎉**
