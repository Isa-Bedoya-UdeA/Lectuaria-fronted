import api from "../config/api";

/**
 * Types for friend activity
 */
export interface FriendActivityDTO {
    id: number;
    userId: number;
    userName: string;
    activityType: 'BOOK_ADDED' | 'BOOK_RATED' | 'BOOK_REVIEWED' | 'LIST_CREATED' | 'LIST_SHARED' | 'BOOK_ADDED_TO_LIST';
    bookTitle?: string;
    bookId?: number;
    bookIsbn?: string;
    bookCoverUrl?: string;
    bookAuthors?: string[];
    listName?: string;
    listId?: number;
    isPublic?: boolean;
    publicToken?: string;
    visibility?: string;
    rating?: number;
    reviewText?: string;
    createdAt: string;
    updatedAt?: string;
    status?: string;
    helpfulCount?: number;
}

/**
 * Get friend activity feed
 */
export const getFriendActivity = async (usernameSlug: string): Promise<FriendActivityDTO[]> => {
    try {
        const response = await api.get<FriendActivityDTO[]>(`/users/${usernameSlug}/activity`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching friend activity:", error);
        throw error;
    }
};

/**
 * Get friend activity for a specific user
 */
export const getFriendActivityById = async (userId: number): Promise<FriendActivityDTO[]> => {
    try {
        const response = await api.get<FriendActivityDTO[]>(`/users/activity/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching friend activity by ID:", error);
        throw error;
    }
};
