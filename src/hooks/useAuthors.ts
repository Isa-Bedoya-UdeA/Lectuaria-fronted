import { useState, useCallback, useEffect } from "react";
import { getAuthors } from "../services/authorService";
import type { Author, ApiError } from "../types";

interface UseAuthorsReturn {
	authors: Author[];
	isLoading: boolean;
	error: string | null;
	fetchAuthors: () => Promise<void>;
	clearError: () => void;
}

export function useAuthors(): UseAuthorsReturn {
	const [authors, setAuthors] = useState<Author[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAuthors = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await getAuthors();
			setAuthors(data);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "Failed to fetch authors");
			setAuthors([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Auto-fetch on mount
	useEffect(() => {
		fetchAuthors();
	}, [fetchAuthors]);

	const clearError = useCallback(() => setError(null), []);

	return {
		authors,
		isLoading,
		error,
		fetchAuthors,
		clearError,
	};
}
