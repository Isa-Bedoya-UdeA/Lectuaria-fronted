import api from "../config/api";
import { unwrapEntity } from "./apiHateoas";
import type { BookShareRequestDTO, ShareLinkDTO } from "@/types";

export const shareBookWithFriends = async (
    bookId: number,
    data: BookShareRequestDTO
): Promise<{ successfulShares: number; failedShares: number; errorMessages: string[]; message: string }> => {
    const response = await api.post(`/books/${bookId}/share`, data);
    return unwrapEntity<{ successfulShares: number; failedShares: number; errorMessages: string[]; message: string }>(response);
};

export const getBookShareLink = async (bookId: number): Promise<ShareLinkDTO> => {
    const response = await api.get(`/books/${bookId}/share-link`);
    return unwrapEntity<ShareLinkDTO>(response);
};

export const isBookSharedWithFriend = async (
    bookId: number,
    friendId: number
): Promise<boolean> => {
    const response = await api.get(`/books/${bookId}/shared-with/${friendId}`);
    return unwrapEntity<boolean>(response);
};
