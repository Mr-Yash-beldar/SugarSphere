import api from './client';
import { ApiResponse, Notification } from '@/types';

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number; pagination?: any }>> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
