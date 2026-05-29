#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Event Management System Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Node.js
echo -e "${YELLOW}[1] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js${NC}"
    exit 1
fi

# Check MongoDB
echo -e "\n${YELLOW}[2] Checking MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB is installed${NC}"
else
    echo -e "${RED}✗ MongoDB not found. Please install MongoDB${NC}"
fi

# Check Backend
echo -e "\n${YELLOW}[3] Checking Backend Setup...${NC}"
if [ -f "event/backend/package.json" ]; then
    echo -e "${GREEN}✓ Backend package.json found${NC}"
else
    echo -e "${RED}✗ Backend package.json not found${NC}"
fi

if [ -f "event/backend/.env" ]; then
    echo -e "${GREEN}✓ Backend .env file found${NC}"
else
    echo -e "${RED}✗ Backend .env file not found${NC}"
fi

# Check Frontend
echo -e "\n${YELLOW}[4] Checking Frontend Setup...${NC}"
if [ -f "event/frontend/package.json" ]; then
    echo -e "${GREEN}✓ Frontend package.json found${NC}"
else
    echo -e "${RED}✗ Frontend package.json not found${NC}"
fi

if [ -f "event/frontend/.env.local" ]; then
    echo -e "${GREEN}✓ Frontend .env.local file found${NC}"
else
    echo -e "${RED}✗ Frontend .env.local file not found${NC}"
fi

# Check key files
echo -e "\n${YELLOW}[5] Checking Authorization Files...${NC}"
FILES_TO_CHECK=(
    "event/backend/src/models/User.js"
    "event/backend/src/controllers/authController.js"
    "event/frontend/app/login/user/page.tsx"
    "event/frontend/app/login/admin/page.tsx"
    "event/frontend/app/register/user/page.tsx"
    "event/frontend/app/register/admin/page.tsx"
    "event/frontend/context/AuthContext.tsx"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file not found${NC}"
    fi
done

# Check documentation
echo -e "\n${YELLOW}[6] Checking Documentation...${NC}"
DOCS=(
    "event/SETUP_GUIDE.md"
    "event/QUICK_START.md"
    "event/IMPLEMENTATION_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc${NC}"
    else
        echo -e "${RED}✗ $doc not found${NC}"
    fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Instructions${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}1. Start MongoDB:${NC}"
echo "   mongod"

echo -e "\n${YELLOW}2. Start Backend:${NC}"
echo "   cd event/backend"
echo "   npm install"
echo "   npm run dev"

echo -e "\n${YELLOW}3. Start Frontend:${NC}"
echo "   cd event/frontend"
echo "   npm install"
echo "   npm run dev"

echo -e "\n${YELLOW}4. Seed Database (Optional):${NC}"
echo "   cd event/backend"
echo "   npm run seed"

echo -e "\n${YELLOW}5. Access Application:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Test Credentials${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Admin:${NC}"
echo "  Email: admin@example.com"
echo "  Password: Admin@123"
echo "  URL: http://localhost:3000/login/admin"
echo "  Code: ADMIN123"

echo -e "\n${GREEN}Organizer:${NC}"
echo "  Email: organizer@example.com"
echo "  Password: Organizer@123"
echo "  URL: http://localhost:3000/login/user"

echo -e "\n${GREEN}Vendor:${NC}"
echo "  Email: vendor@example.com"
echo "  Password: Vendor@123"
echo "  URL: http://localhost:3000/login/user"

echo -e "\n${GREEN}Attendee:${NC}"
echo "  Email: attendee@example.com"
echo "  Password: Attendee@123"
echo "  URL: http://localhost:3000/login/user"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Verification Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"
