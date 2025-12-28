# MongoDB Setup Summary

## ✅ Completed Setup Tasks

### 1. **Dependencies Installed**
   - ✅ `mongoose` - MongoDB Object Data Modeling (v7.x)
   - ✅ `dotenv` - Environment variable management

### 2. **Configuration Files Created**
   - ✅ `.env.local` - Local environment variables with MongoDB URI
   - ✅ `.env.example` - Template for environment variables
   - ✅ `lib/mongodb.ts` - MongoDB connection handler with connection pooling

### 3. **Database Models Created**
   - ✅ `models/User.ts` - User schema with validation
   - ✅ `models/Event.ts` - Event schema with ticket types
   - ✅ `models/Ticket.ts` - Ticket schema with unique ticket numbers
   - ✅ `models/Registration.ts` - Registration schema

### 4. **API Routes Created**
   - ✅ `api/users` - GET (all users), POST (create user)
   - ✅ `api/users/[id]` - GET, PUT, DELETE individual users
   - ✅ `api/events` - GET (all events), POST (create event)
   - ✅ `api/events/[id]` - GET, PUT, DELETE individual events
   - ✅ `api/tickets` - GET (all tickets), POST (create ticket)
   - ✅ `api/registrations` - GET (all registrations), POST (create registration)
   - ✅ `api/health` - Health check endpoint

### 5. **Helper/Integration Files Created**
   - ✅ `lib/mongoDBIntegration.tsx` - React integration examples and API service
   - ✅ `MONGODB_SETUP.md` - Detailed setup guide
   - ✅ `MONGODB_QUICK_START.md` - Quick start guide

### 6. **Project Build Status**
   - ✅ **Build Successful** - All TypeScript compilation passed
   - ✅ **All Routes Detected** - 9 API routes ready

## 📋 File Structure

```
app/
├── api/
│   ├── users/
│   │   ├── route.ts           # GET/POST all users
│   │   └── [id]/
│   │       └── route.ts       # GET/PUT/DELETE single user
│   ├── events/
│   │   ├── route.ts           # GET/POST all events
│   │   └── [id]/
│   │       └── route.ts       # GET/PUT/DELETE single event
│   ├── tickets/
│   │   └── route.ts           # GET/POST tickets
│   ├── registrations/
│   │   └── route.ts           # GET/POST registrations
│   └── health/
│       └── route.ts           # Health check
├── components/
├── AuthContext.tsx
└── ...

lib/
├── mongodb.ts                  # MongoDB connection
└── mongoDBIntegration.tsx      # React integration examples

models/
├── User.ts                     # User schema
├── Event.ts                    # Event schema
├── Ticket.ts                   # Ticket schema
└── Registration.ts            # Registration schema

.env.local                      # Environment variables
.env.example                    # Environment template
MONGODB_SETUP.md               # Detailed guide
MONGODB_QUICK_START.md         # Quick start guide
```

## 🚀 Getting Started

### Step 1: Install MongoDB Locally
```bash
# Download from: https://www.mongodb.com/try/download/community
# Run the installer and follow setup
# MongoDB will start as Windows Service automatically
```

### Step 2: Verify Installation
```bash
mongosh
# You should see: "test>"
```

### Step 3: Start Development Server
```bash
cd d:\FYP-Frontend\event
npm run dev
```

### Step 4: Test MongoDB Connection
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "MongoDB connection successful!",
  "timestamp": "2024-11-30T..."
}
```

## 📚 Available API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event by ID
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket

### Registrations
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Create new registration

### Health
- `GET /api/health` - Check MongoDB connection status

## 💻 React Component Integration

Use the helper service for API calls:

```typescript
import { apiService } from '@/lib/mongoDBIntegration';

// Get all events
const events = await apiService.getEvents();

// Create new event
await apiService.createEvent({
  title: "My Event",
  description: "Event description",
  date: new Date().toISOString(),
  time: "10:00 AM",
  location: "Venue",
  category: "Technology",
  organizer: "Organization",
  capacity: 100,
  ticketTypes: [
    { name: "Standard", price: 50, quantity: 100 }
  ]
});

// Get specific event
const event = await apiService.getEventById(eventId);

// Update event
await apiService.updateEvent(eventId, { title: "Updated Title" });

// Delete event
await apiService.deleteEvent(eventId);
```

## 🔧 Environment Variables

**`.env.local`** (for local development):
```env
MONGODB_URI=mongodb://localhost:27017/event-management
NODE_ENV=development
```

**Production** (MongoDB Atlas):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
NODE_ENV=production
```

## 📊 Database Schemas

### User Schema
```typescript
{
  name: String,
  email: String (unique),
  password: String,
  role: 'user' | 'admin',
  phone: String (optional),
  location: String (optional),
  profileImage: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Event Schema
```typescript
{
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  category: String,
  organizer: String,
  image: String (optional),
  capacity: Number,
  registeredUsers: [String],
  ticketTypes: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Schema
```typescript
{
  eventId: String,
  userId: String,
  ticketNumber: String (unique),
  ticketType: String,
  price: Number,
  status: 'valid' | 'used' | 'cancelled',
  qrCode: String (optional),
  purchaseDate: Date,
  updatedAt: Date
}
```

### Registration Schema
```typescript
{
  eventId: String,
  userId: String,
  fullName: String,
  email: String,
  phone: String,
  ticketType: String,
  quantity: Number,
  totalPrice: Number,
  status: 'registered' | 'confirmed' | 'cancelled',
  registrationDate: Date,
  updatedAt: Date
}
```

## 🔍 Testing the APIs

### Test with cURL

**Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "pass123",
    "role": "user"
  }'
```

**Get all users:**
```bash
curl http://localhost:3000/api/users
```

**Create an event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conf 2024",
    "description": "Annual tech conference",
    "date": "2024-12-15T00:00:00Z",
    "time": "09:00 AM",
    "location": "NYC",
    "category": "Technology",
    "organizer": "TechOrg",
    "capacity": 500,
    "ticketTypes": [
      {"name": "Standard", "price": 50, "quantity": 300}
    ]
  }'
```

## ⚙️ Next Steps

1. **Integrate with UI Components** - Add API calls to event creation/listing components
2. **Add Authentication** - Implement JWT for secure API access
3. **Add Validation** - Middleware to validate request data
4. **Error Handling** - Improve error responses and logging
5. **Database Indexing** - Add indexes for frequently queried fields
6. **Caching** - Implement Redis for caching common queries

## 🆘 Troubleshooting

### MongoDB Won't Connect
```
Error: connect ECONNREFUSED
```
**Solution:** Start MongoDB service or use Atlas cloud version

### Build Errors
```bash
npm run build
# If errors occur, check:
# 1. All model imports are correct
# 2. .env.local file exists
# 3. TypeScript types are valid
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

## 📞 Support Resources

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**MongoDB Integration Complete! 🎉**

Your Event Management System now has a fully functional MongoDB backend with all necessary models, routes, and integration helpers ready to use.
