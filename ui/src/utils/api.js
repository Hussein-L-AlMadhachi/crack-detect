const API_BASE_URL = 'http://localhost:8000';

class Api {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(username, email, password, userType) {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        username,
        email,
        password,
        user_type: userType
      }),
    });
    return this.handleResponse(response);
  }

  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/token`, {
      method: 'POST',
      body: formData,
    });
    const data = await this.handleResponse(response);
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadImage(file, pixelsPerMm = 10.0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pixels_per_mm', pixelsPerMm.toString());

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getHistory() {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUploadDetail(uploadId) {
    const response = await fetch(`${API_BASE_URL}/api/history/${uploadId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }
    return response.json();
  }
}

export default new Api();
