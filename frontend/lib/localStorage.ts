import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  phone?: string;
  location?: string;
  role: 'user' | 'admin';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

class LocalStorage {
  private usersFile: string = USERS_FILE;

  private getUsers(): StoredUser[] {
    try {
      if (!fs.existsSync(this.usersFile)) {
        return [];
      }
      const data = fs.readFileSync(this.usersFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }

  private saveUsers(users: StoredUser[]): void {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
      console.log(`✅ Data saved to local storage: ${users.length} users`);
    } catch (error) {
      console.error('Error saving users file:', error);
    }
  }

  createUser(userData: Omit<StoredUser, '_id' | 'createdAt' | 'updatedAt'>): StoredUser {
    const users = this.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser: StoredUser = {
      ...userData,
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    console.log(`✅ User created: ${newUser.email} (ID: ${newUser._id})`);
    return newUser;
  }

  findUserByEmail(email: string): StoredUser | undefined {
    const users = this.getUsers();
    return users.find(u => u.email === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    const users = this.getUsers();
    return users.find(u => u._id === id);
  }

  findUserByGoogleId(googleId: string): StoredUser | undefined {
    const users = this.getUsers();
    return users.find(u => u.googleId === googleId);
  }

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u._id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedUser = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    this.saveUsers(users);
    console.log(`✅ User updated: ${updatedUser.email}`);
    return updatedUser;
  }

  getAllUsers(): StoredUser[] {
    return this.getUsers();
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u._id !== id);
    
    if (filteredUsers.length === users.length) {
      return false; // User not found
    }

    this.saveUsers(filteredUsers);
    console.log(`✅ User deleted: ${id}`);
    return true;
  }

  getUserCount(): number {
    return this.getUsers().length;
  }

  exportUsers(): string {
    const users = this.getUsers();
    return JSON.stringify(users, null, 2);
  }
}

export const localStorage = new LocalStorage();
