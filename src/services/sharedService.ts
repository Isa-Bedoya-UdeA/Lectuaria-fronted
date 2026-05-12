import api from '../config/api';
import type { SharedBook, SharedList } from '../types/shared';

export const getSharedBooks = async (): Promise<SharedBook[]> => {
    try {
        const response = await api.get<SharedBook[]>('/shared-with-me/books');
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch shared books" };
    }
};

export const getSharedLists = async (): Promise<SharedList[]> => {
    try {
        const response = await api.get<SharedList[]>('/shared-with-me/lists');
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch shared lists" };
    }
};
