export const API_BASE_URL = 'http://127.0.0.1:8000';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'API Request Failed');
  }

  return data;
}