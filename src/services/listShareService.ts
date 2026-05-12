import api from '../config/api';
import type { UserListShare, UserListShareLink } from '../types/notifications';

export const shareListWithFriends = async (
    listId: number,
    data: { friendIds: number[]; message?: string }
): Promise<{ successfulShares: number; failedShares: number; errorMessages: string[]; message: string }> => {
    const response = await api.post(`/user-list-shares/${listId}/share-multiple`, data);
    return response.data;
};

export const shareListWithFriend = async (listId: number, friendId: number): Promise<UserListShare> => {
    try {
        const response = await api.post<UserListShare>(`/user-list-shares/${listId}/share/${friendId}`);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to share list with friend" };
    }
};

export const getListShares = async (listId: number): Promise<UserListShare[]> => {
    try {
        const response = await api.get<UserListShare[]>(`/user-list-shares/public-link/${listId}`);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to get list shares" };
    }
};

export const removeListShare = async (shareId: number): Promise<void> => {
    try {
        await api.delete(`/user-list-shares/${shareId}`);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to remove list share" };
    }
};

export const createPublicShareLink = async (listId: number): Promise<UserListShareLink> => {
    try {
        const response = await api.post<UserListShareLink>(`/user-list-shares/public-link/${listId}`);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to create public share link" };
    }
};

export const getListShareLinks = async (listId: number): Promise<UserListShareLink[]> => {
    try {
        const response = await api.get<UserListShareLink[]>(`/user-list-shares/public-link/${listId}`);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to get list share links" };
    }
};

export const deactivateShareLink = async (linkId: number): Promise<void> => {
    try {
        await api.delete(`/user-list-shares/public-link/${linkId}`);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to deactivate share link" };
    }
};

export const getSharedListByToken = async (token: string): Promise<UserListShare> => {
    try {
        const response = await api.get<UserListShare>(`/user-list-shares/public/${token}`);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to get shared list" };
    }
};
