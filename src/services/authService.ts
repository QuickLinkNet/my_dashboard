import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginResponse {
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('isAuthenticated', 'true');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    delete axios.defaults.headers.common['Authorization'];
  },

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
};
