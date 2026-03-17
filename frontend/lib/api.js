'use client';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campus-bites-server.vercel.app/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);


  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error('API Error:', error);
    throw new Error(error.error || `Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  signup: (name, email, password, phone) => 
    apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMenuItems: () => apiFetch('/menu/items'),
  
  getMenuItem: (id) => apiFetch(`/menu/items/${id}`),

  getOrders: () => apiFetch('/orders'),

  getOrder: (id) => apiFetch(`/orders/${id}`),

  updateOrderStatus: (id, status) =>
    apiFetch(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getProfile: () => apiFetch('/users/profile'),

  updateProfile: (name) =>
    apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  createMenuItem: (data) =>
    apiFetch('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMenuItem: (id, data) =>
    apiFetch(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMenuItem: (id) =>
    apiFetch(`/menu/items/${id}`, {
      method: 'DELETE',
    }),

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getToken();
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};