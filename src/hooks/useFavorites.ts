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
            // Silently handle 401/403 errors - user is not authenticated
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setFavoritesList(null);
                return;
            }
            setError(err?.message || "Error al cargar favoritos");
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
            setError(err?.message || "Error al agregar a favoritos");
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
            setError(err?.message || "Error al quitar de favoritos");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkBookIsFavorite = useCallback(async (bookId: number): Promise<boolean> => {
        try {
            return await isBookInFavorites(bookId);
        } catch (err: any) {
            // Silently handle errors - return false for unauthenticated users
            // Don't log 401/403 as these are expected when not logged in
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                return false;
            }
            // Only log unexpected errors
            console.error("Error checking favorite status:", err);
            return false;
        }
    }, []);

    useEffect(() => {
        // Solo cargar favoritos si el usuario está autenticado y no es bibliotecario
        const userRole = localStorage.getItem('userRole');
        const accessToken = localStorage.getItem('accessToken');
        
        // Solo cargar si hay un token Y no es bibliotecario
        if (accessToken && userRole !== 'LIBRARIAN') {
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
