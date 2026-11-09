import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT Token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Catch 401 Unauthorized errors to clean up expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service Methods
export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Employee Service Methods
export const employeeService = {
  getEmployees: async (page = 1, limit = 10) => {
    const response = await api.get(`/employees/?page=${page}&limit=${limit}`);
    return response.data;
  },
  createEmployee: async (employeeData) => {
    const response = await api.post("/employees/", employeeData);
    return response.data;
  },
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
};

// Department Service Methods
export const departmentService = {
  getDepartments: async () => {
    const response = await api.get("/departments/");
    return response.data;
  },
};

// Leave Service Methods
export const leaveService = {
  getStats: async () => {
    const response = await api.get("/leaves/dashboard/stats");
    return response.data;
  },
  getLeaves: async (statusFilter = null) => {
    const url = statusFilter ? `/leaves/?status=${statusFilter}` : "/leaves/";
    const response = await api.get(url);
    return response.data;
  },
  applyLeave: async (leaveData) => {
    const response = await api.post("/leaves/", leaveData);
    return response.data;
  },
  updateLeaveStatus: async (leaveId, status) => {
    const response = await api.put(`/leaves/${leaveId}/status`, { status });
    return response.data;
  },
};

export default api;