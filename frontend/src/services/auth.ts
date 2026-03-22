import { apiRequest } from './api';
import type { User } from '../types';

export type Session = {
  access_token: string;
  token_type: string;
  role: string;
};

export async function login(email: string, password: string, admin = false) {
  return apiRequest<Session>(admin ? '/auth/admin-login' : '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string) {
  return apiRequest<User>('/auth/me', {}, token);
}
