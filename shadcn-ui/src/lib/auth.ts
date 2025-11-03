export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const USERS_KEY = 'ezidcode_users';
const CURRENT_USER_KEY = 'ezidcode_current_user';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

export const authService = {
  // Initialize admin user if not exists
  initializeAdmin: () => {
    const users = authService.getAllUsers();
    const adminExists = users.some(u => u.username === ADMIN_USERNAME);
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-001',
        username: ADMIN_USERNAME,
        email: 'admin@ezidcode.ai',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      users.push(adminUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(`ezidcode_password_${ADMIN_USERNAME}`, ADMIN_PASSWORD);
    }
  },

  // Get all users
  getAllUsers: (): User[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // Register new user
  register: (username: string, email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = authService.getAllUsers();
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`ezidcode_password_${username}`, password);

    return { success: true, message: 'Registration successful', user: newUser };
  },

  // Login
  login: (username: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = authService.getAllUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const storedPassword = localStorage.getItem(`ezidcode_password_${username}`);
    if (storedPassword !== password) {
      return { success: false, message: 'Invalid password' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful', user };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.isAdmin || false;
  },

  // Change password
  changePassword: (username: string, oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    const storedPassword = localStorage.getItem(`ezidcode_password_${username}`);
    
    if (storedPassword !== oldPassword) {
      return { success: false, message: 'Invalid old password' };
    }

    localStorage.setItem(`ezidcode_password_${username}`, newPassword);
    return { success: true, message: 'Password changed successfully' };
  }
};

// Initialize admin on module load
authService.initializeAdmin();
