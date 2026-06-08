import api from "../config/api";
import { unwrapCollection, unwrapEntity } from "./apiHateoas";
import type { UserListDTO } from "../types";

/**
 * Get the favorites list for the current user
 */
export const getFavoritesList = async (): Promise<UserListDTO | null> => {
    try {
        const response = await api.get("/lists");
        const all = unwrapCollection<UserListDTO>(response);
        const favoritesList = all.find(list => list.name === "Favoritos");
        return favoritesList || null;
    } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            console.error("Error fetching favorites list:", error);
        }
        return null;
    }
};

/**
 * Add a book to favorites list
 */
export const addToFavorites = async (bookId: number): Promise<void> => {
    try {
        const lists = await api.get("/lists");
        const all = unwrapCollection<UserListDTO>(lists);
        const favoritesList = all.find(list => list.name === "Favoritos");

        if (!favoritesList) {
            throw new Error("Lista de favoritos no encontrada");
        }

        await api.post(`/lists/${favoritesList.id}/books/${bookId}?force=false`);
    } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            console.error("Error adding to favorites:", error);
        }
        throw error;
    }
};

/**
 * Remove a book from favorites list
 */
export const removeFromFavorites = async (bookId: number): Promise<void> => {
    try {
        const lists = await api.get("/lists");
        const all = unwrapCollection<UserListDTO>(lists);
        const favoritesList = all.find(list => list.name === "Favoritos");

        if (!favoritesList) {
            throw new Error("Lista de favoritos no encontrada");
        }

        await api.delete(`/lists/${favoritesList.id}/books/${bookId}`);
    } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            console.error("Error removing from favorites:", error);
        }
        throw error;
    }
};

/**
 * Check if a book is in favorites list
 */
export const isBookInFavorites = async (bookId: number): Promise<boolean> => {
    try {
        const lists = await api.get("/lists");
        const all = unwrapCollection<UserListDTO>(lists);
        const favoritesList = all.find(list => list.name === "Favoritos");

        if (!favoritesList) {
            return false;
        }

        const listDetails = await api.get(`/lists/${favoritesList.id}`);
        const list = unwrapEntity<UserListDTO>(listDetails);
        return list.books?.some(book => book.id === bookId) || false;
    } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            console.error("Error checking favorites status:", error);
        }
        return false;
    }
};