# MongoDB Setup Guide

## Installation

### Option 1: Local MongoDB Installation (Windows)

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows and download the installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Install MongoDB as a Service" (recommended)
   - Keep the default installation path: `C:\Program Files\MongoDB\Server\{version}`
   - MongoDB will start automatically as a Windows Service

3. **Verify Installation**
   ```bash
   mongosh
   ```
   This should open the MongoDB shell

4. **Start MongoDB Service** (if needed)
   ```bash
   # In Windows Services, find "MongoDB Server" and ensure it's running
   # Or via PowerShell (as Administrator):
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud) - Recommended for Production

1. **Create MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free
   - Create a new project

2. **Create a Cluster**
   - Click "Create Deployment"
   - Choose "Serverless" (free tier)
   - Select your region
   - Click "Create Deployment"

3. **Get Connection String**
   - Go to "Database" → "Connect"
   - Click "Drivers"
   - Copy the connection string

4. **Update .env.local**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
   ```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/event-management
NODE_ENV=development
```

For production (MongoDB Atlas):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management?retryWrites=true&w=majority
NODE_ENV=production
```

### 2. Models Created

The following MongoDB models are available:

#### User Model (`/models/User.ts`)
- name: String
- email: String (unique)
- password: String
- role: 'user' | 'admin'
- phone: String (optional)
- location: String (optional)
- profileImage: String (optional)

#### Event Model (`/models/Event.ts`)
- title: String
- description: String
- date: Date
- time: String
- location: String
- category: String
- organizer: String
- image: String (optional)
- capacity: Number
- registeredUsers: Array of User IDs
- ticketTypes: Array of ticket types with price and quantity
- status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

#### Ticket Model (`/models/Ticket.ts`)
- eventId: String (reference to Event)
- userId: String (reference to User)
- ticketNumber: String (unique)
- ticketType: String
- price: Number
- status: 'valid' | 'used' | 'cancelled'
- qrCode: String (optional)
- purchaseDate: Date

#### Registration Model (`/models/Registration.ts`)
- eventId: String (reference to Event)
- userId: String (reference to User)
- fullName: String
- email: String
- phone: String
- ticketType: String
- quantity: Number
- totalPrice: Number
- status: 'registered' | 'confirmed' | 'cancelled'

## API Routes

### Users API
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Events API
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get specific event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Tickets API
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket

### Registrations API
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Create new registration

## Usage Examples

### Create a User
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

### Get All Events
```bash
curl http://localhost:3000/api/events
```

### Create an Event
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

## Troubleshooting

### MongoDB Connection Error
1. Ensure MongoDB service is running
2. Check `.env.local` has correct `MONGODB_URI`
3. Verify MongoDB is listening on the correct port (27017 by default)

### Permission Denied
- Run MongoDB with appropriate permissions
- On Windows, ensure MongoDB Service is running with admin privileges

### Database Already Exists
- This is normal, MongoDB will use existing database if it has the same name

## Docker Setup (Optional)

Run MongoDB in Docker:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

Update `.env.local`:
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/event-management?authSource=admin
```

## Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
