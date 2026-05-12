import { useState, useCallback, useEffect } from "react";
import { getGenresWithBookCount } from "../services/genreService";
import type { GenreWithBookCount, ApiError } from "../types";

interface UseGenresWithBookCountReturn {
    genresWithCount: GenreWithBookCount[];
    isLoading: boolean;
    error: string | null;
    fetchGenresWithBookCount: () => Promise<void>;
    clearError: () => void;
}

export function useGenresWithBookCount(): UseGenresWithBookCountReturn {
    const [genresWithCount, setGenresWithCount] = useState<GenreWithBookCount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGenresWithBookCount = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getGenresWithBookCount();
            setGenresWithCount(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || "Failed to fetch genres with book count");
            setGenresWithCount([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchGenresWithBookCount();
    }, [fetchGenresWithBookCount]);

    const clearError = useCallback(() => setError(null), []);

    return {
        genresWithCount,
        isLoading,
        error,
        fetchGenresWithBookCount,
        clearError,
    };
}
