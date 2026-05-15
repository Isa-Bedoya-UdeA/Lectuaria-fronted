import { useState, useCallback, useEffect } from "react";
import { 
    getFavoritesList, 
    addToFavorites, 
    removeFromFavorites, 
    isBookInFavorites 
} from "../services/favoriteService";

export const useFavorites = () => {
    const [favoritesList, setFavoritesList] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadFavoritesList = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const list = await getFavoritesList();
            setFavoritesList(list?.id || null);
        } catch (err: any) {
            setError(err.message || "Error al cargar favoritos");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addBookToFavorites = useCallback(async (bookId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await addToFavorites(bookId);
            // Refresh the favorites list ID
            await loadFavoritesList();
        } catch (err: any) {
            setError(err.message || "Error al agregar a favoritos");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeBookFromFavorites = useCallback(async (bookId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await removeFromFavorites(bookId);
            // Refresh the favorites list ID
            await loadFavoritesList();
        } catch (err: any) {
            setError(err.message || "Error al quitar de favoritos");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkBookIsFavorite = useCallback(async (bookId: number): Promise<boolean> => {
        try {
            return await isBookInFavorites(bookId);
        } catch (err: any) {
            console.error("Error checking favorite status:", err);
            return false;
        }
    }, []);

    useEffect(() => {
        // Solo cargar favoritos para lectores, no para bibliotecarios
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'LIBRARIAN') {
            loadFavoritesList();
        }
    }, [loadFavoritesList]);

    return {
        favoritesListId: favoritesList,
        isLoading,
        error,
        loadFavoritesList,
        addBookToFavorites,
        removeBookFromFavorites,
        checkBookIsFavorite,
        clearError: () => setError(null),
    };
};
