import { useState, useCallback, useEffect } from "react";
import { getGenres } from "../services/genreService";
import type { Genre, ApiError } from "../types";

interface UseGenresReturn {
	genres: Genre[];
	isLoading: boolean;
	error: string | null;
	fetchGenres: () => Promise<void>;
	clearError: () => void;
}

export function useGenres(): UseGenresReturn {
	const [genres, setGenres] = useState<Genre[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchGenres = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await getGenres();
			setGenres(data);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "Failed to fetch genres");
			setGenres([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Auto-fetch on mount
	useEffect(() => {
		fetchGenres();
	}, [fetchGenres]);

	const clearError = useCallback(() => setError(null), []);

	return {
		genres,
		isLoading,
		error,
		fetchGenres,
		clearError,
	};
}
