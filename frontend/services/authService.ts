// src/services/authService.ts

import { User } from '../types'; // Assuming you have a User type defined
 
// Since the frontend is now served by the backend, all API calls are on the same origin.
// We can use a relative path, which simplifies the code and removes the need for environment variables here.
const API_URL = '/auth';

export const loginSuccess = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/login/success`, {
      credentials: 'include', // Important for sending the session cookie
      headers: {
        'Accept': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Error checking login status:', error);
    return null;
  }
};

export const googleLogin = () => {
  window.open(`${API_URL}/google`, '_self');
};

export const logout = async (): Promise<void> => {
  try {
    // The backend will destroy the session.
    await fetch(`${API_URL}/logout`, { credentials: 'include' });
    // After the request, we force a reload to the homepage to clear all state.
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
