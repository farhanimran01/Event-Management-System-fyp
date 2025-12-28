# 🎯 MongoDB Setup - Quick Reference

## ⚡ TL;DR - Get Started in 2 Minutes

```bash
cd d:\FYP-Frontend\event
npm run dev
# Visit: http://localhost:3000
# Test: curl http://localhost:3000/api/health
```

---

## 📋 What's Configured

### ✅ Database
- MongoDB Atlas Cloud
- Database: `event-management`
- Cluster: `cluster0.5u1mo.mongodb.net`
- Status: **ACTIVE**

### ✅ Environment
```env
MONGODB_URI=mongodb+srv://np03cs4a230270_db_user:...@cluster0.5u1mo.mongodb.net/...
```

### ✅ Models (4 total)
- User (authentication)
- Event (event management)
- Ticket (ticket tracking)
- Registration (attendee tracking)

### ✅ API Endpoints (15 total)
- `/api/users` (CRUD)
- `/api/events` (CRUD)
- `/api/tickets` (CRUD)
- `/api/registrations` (CRUD)
- `/api/health` (status check)

### ✅ Components (25 total)
- 7 Admin views
- 2 Auth forms
- 8 User components
- 3 Navigation components
- 1 UI component library

---

## 🚀 Common Commands

```bash
# Development
npm run dev                    # Start server

# Production
npm run build                  # Build
npm start                      # Start

# Quality
npm run lint                   # Check
npm run lint --fix             # Fix
```

---

## 📡 API Quick Reference

### Create User
```bash
POST /api/users
{
  "name": "John",
  "email": "john@example.com",
  "password": "pass123",
  "role": "user"
}
```

### Get Users
```bash
GET /api/users
```

### Create Event
```bash
POST /api/events
{
  "title": "Event Name",
  "description": "Description",
  "date": "2024-12-15T00:00:00Z",
  "time": "10:00 AM",
  "location": "NYC",
  "category": "Technology",
  "organizer": "Org",
  "capacity": 100,
  "ticketTypes": [
    {"name": "Standard", "price": 50, "quantity": 100}
  ]
}
```

### Get Events
```bash
GET /api/events
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot find module` | `npm install` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| MongoDB connection failed | Check Atlas cluster status |
| Build error | `rm -r .next && npm run build` |

---

## 📚 Documentation Files

```
START_HERE.md              👈 Overview
COMPLETE_SETUP.md          📊 Complete summary
MONGODB_SETUP.md           📖 Detailed guide
MONGODB_QUICK_START.md     ⚡ Quick start
MONGODB_ATLAS_CONFIG.md    🔐 Configuration
SETUP_SUMMARY.md           📋 Summary
VERIFICATION_CHECKLIST.md  ✅ Checklist
```

---

## 🎯 Next Steps

1. **Start server** → `npm run dev`
2. **Test API** → `curl http://localhost:3000/api/health`
3. **Create data** → Use API endpoints
4. **Build features** → Use components

---

## 💡 Useful Endpoints

```
GET    http://localhost:3000/api/health          ← Test connection
GET    http://localhost:3000/api/users            ← List users
POST   http://localhost:3000/api/users            ← Create user
GET    http://localhost:3000/api/events           ← List events
POST   http://localhost:3000/api/events           ← Create event
```

---

## 🎓 Learn More

- Read: `COMPLETE_SETUP.md`
- Read: `START_HERE.md`
- Read: `VERIFICATION_CHECKLIST.md`

---

**Everything is ready! Start building! 🚀**
