import { apiRequest } from './api';
import type { Agent, Chat, Message, Notification, UsageLog, User } from '../types';

export const platformService = {
  listAgents: (token: string) => apiRequest<Agent[]>('/agents', {}, token),
  createAgent: (token: string, payload: Partial<Agent>) =>
    apiRequest<Agent>('/agents', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateAgent: (token: string, agentId: number, payload: Partial<Agent>) =>
    apiRequest<Agent>(`/agents/${agentId}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  listChats: (token: string, agentId: number) => apiRequest<Chat[]>(`/agents/${agentId}/chats`, {}, token),
  createChat: (token: string, agentId: number, title: string) =>
    apiRequest<Chat>(`/agents/${agentId}/chats`, { method: 'POST', body: JSON.stringify({ title }) }, token),
  listMessages: (token: string, chatId: number) => apiRequest<Message[]>(`/chats/${chatId}/messages`, {}, token),
  sendMessage: (token: string, chatId: number, content: string) =>
    apiRequest<Message[]>(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }, token),
  listNotifications: (token: string) => apiRequest<Notification[]>('/notifications', {}, token),
  markNotification: (token: string, notificationId: number, isRead: boolean) =>
    apiRequest<Notification>(`/notifications/${notificationId}`, { method: 'PATCH', body: JSON.stringify({ is_read: isRead }) }, token),
  adminListUsers: (token: string) => apiRequest<User[]>('/admin/users', {}, token),
  adminCreateUser: (token: string, payload: Record<string, unknown>) =>
    apiRequest<User>('/admin/users', { method: 'POST', body: JSON.stringify(payload) }, token),
  adminDeleteUser: (token: string, userId: number) => apiRequest<void>(`/admin/users/${userId}`, { method: 'DELETE' }, token),
  adminListAgents: (token: string) => apiRequest<Agent[]>('/admin/agents', {}, token),
  adminAssignAgent: (token: string, payload: Record<string, unknown>) =>
    apiRequest<Agent>('/admin/agents', { method: 'POST', body: JSON.stringify(payload) }, token),
  adminDeleteAgent: (token: string, agentId: number) => apiRequest<void>(`/admin/agents/${agentId}`, { method: 'DELETE' }, token),
  adminListNotifications: (token: string) => apiRequest<Notification[]>('/admin/notifications', {}, token),
  adminCreateNotification: (token: string, payload: Record<string, unknown>) =>
    apiRequest<Notification>('/admin/notifications', { method: 'POST', body: JSON.stringify(payload) }, token),
  adminUsageLogs: (token: string) => apiRequest<UsageLog[]>('/admin/usage-logs', {}, token),
  adminPrompts: (token: string) => apiRequest<Array<Record<string, unknown>>>('/admin/prompts', {}, token),
};
