import api from "../config/api";
import type { UserSearchResponseDTO } from "../types";

export const searchReaders = async (query: string): Promise<UserSearchResponseDTO[]> => {
    const response = await api.get(`/friendships/search?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const getFriends = async (): Promise<UserSearchResponseDTO[]> => {
    const response = await api.get('/friendships');
    return response.data;
};

export const getPendingRequests = async (): Promise<UserSearchResponseDTO[]> => {
    const response = await api.get('/friendships/requests/pending');
    return response.data;
};

export const sendFriendshipRequest = async (receiverId: number): Promise<void> => {
    await api.post(`/friendships/requests/${receiverId}`);
};

export const acceptFriendshipRequest = async (requestId: number): Promise<void> => {
    await api.post(`/friendships/requests/${requestId}/accept`);
};

export const rejectFriendshipRequest = async (requestId: number): Promise<void> => {
    await api.post(`/friendships/requests/${requestId}/reject`);
};

export const cancelFriendshipRequest = async (requestId: number): Promise<void> => {
    await api.delete(`/friendships/requests/${requestId}`);
};

export const removeFriendship = async (friendId: number): Promise<void> => {
    await api.delete(`/friendships/${friendId}`);
};
