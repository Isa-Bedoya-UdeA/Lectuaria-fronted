import api from "../config/api";
import type { BookShareRequestDTO, BookShareResponseDTO, ShareLinkDTO } from "@/types";

export const shareBookWithFriends = async (
    bookId: number,
    data: BookShareRequestDTO
): Promise<{ successfulShares: number; failedShares: number; errorMessages: string[]; message: string }> => {
    const response = await api.post(`/books/${bookId}/share`, data);
    return response.data;
};

export const getBookShareLink = async (bookId: number): Promise<ShareLinkDTO> => {
    const response = await api.get(`/books/${bookId}/share-link`);
    return response.data;
};

export const isBookSharedWithFriend = async (
    bookId: number,
    friendId: number
): Promise<boolean> => {
    const response = await api.get(`/books/${bookId}/shared-with/${friendId}`);
    return response.data;
};
