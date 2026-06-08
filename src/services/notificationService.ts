import api from '../config/api';
import { unwrapCollection, unwrapEntity } from "./apiHateoas";
import type { Notification, NotificationPreference } from '../types/notifications';

export const getNotifications = async (unreadOnly?: boolean): Promise<Notification[]> => {
    try {
        const response = await api.get('/notifications', {
            params: unreadOnly ? { unreadOnly: true } : {}
        });
        return unwrapCollection<Notification>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch notifications" };
    }
};

export const getUnreadCount = async (): Promise<number> => {
    try {
        const response = await api.get('/notifications/unread-count');
        const wrapped = unwrapEntity<{ unreadCount: number }>(response);
        return wrapped.unreadCount;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch unread count" };
    }
};

export const markAsRead = async (notificationId: number): Promise<Notification> => {
    try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return unwrapEntity<Notification>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to mark notification as read" };
    }
};

export const markAllAsRead = async (): Promise<void> => {
    try {
        await api.put('/notifications/read-all');
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to mark all as read" };
    }
};

export const deleteNotification = async (notificationId: number): Promise<void> => {
    try {
        await api.delete(`/notifications/${notificationId}`);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to delete notification" };
    }
};

export const deleteAllNotifications = async (): Promise<void> => {
    try {
        await api.delete('/notifications');
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to delete all notifications" };
    }
};

export const getNotificationPreferences = async (): Promise<NotificationPreference[]> => {
    try {
        const response = await api.get('/notification-preferences');
        return unwrapCollection<NotificationPreference>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch notification preferences" };
    }
};

export const updateNotificationPreference = async (type: string, enabled: boolean): Promise<NotificationPreference> => {
    try {
        const response = await api.put(`/notification-preferences/${type}`, null, {
            params: { enabled }
        });
        return unwrapEntity<NotificationPreference>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to update notification preference" };
    }
};

export const resetNotificationPreferences = async (): Promise<void> => {
    try {
        await api.post('/notification-preferences/reset');
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to reset notification preferences" };
    }
};
