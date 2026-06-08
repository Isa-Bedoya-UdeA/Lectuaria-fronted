import api from '../config/api';
import { unwrapCollection } from "./apiHateoas";
import type { SharedBook, SharedList } from '../types/shared';

export const getSharedBooks = async (): Promise<SharedBook[]> => {
    try {
        const response = await api.get('/shared-with-me/books');
        return unwrapCollection<SharedBook>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch shared books" };
    }
};

export const getSharedLists = async (): Promise<SharedList[]> => {
    try {
        const response = await api.get('/shared-with-me/lists');
        return unwrapCollection<SharedList>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: "Failed to fetch shared lists" };
    }
};
