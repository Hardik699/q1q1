const API_BASE = "/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "user" | "admin";
  };
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User API calls
export const userAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to get profile");
    return response.json();
  },

  updateProfile: async (
    token: string,
    data: Partial<User>,
  ): Promise<{ message: string; user: User }> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  getAllUsers: async (token: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to get users");
    return response.json();
  },

  deleteUser: async (token: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete user");
  },
};

// Admin API calls
export const adminAPI = {
  register: async (data: Omit<RegisterRequest, "phone" | "address">) => {
    const response = await fetch(`${API_BASE}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Admin registration failed");
    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Admin login failed");
    return response.json();
  },

  getAllAdmins: async (token: string) => {
    const response = await fetch(`${API_BASE}/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to get admins");
    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to get admin profile");
    return response.json();
  },

  updateProfile: async (token: string, data: any) => {
    const response = await fetch(`${API_BASE}/admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update admin profile");
    return response.json();
  },

  deactivateUser: async (token: string, userId: string) => {
    const response = await fetch(
      `${API_BASE}/admin/deactivate-user/${userId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) throw new Error("Failed to deactivate user");
    return response.json();
  },

  deleteAdmin: async (token: string, adminId: string) => {
    const response = await fetch(`${API_BASE}/admin/${adminId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete admin");
  },
};
