import { useState, useCallback } from "react";
import { searchBooks } from "../services/bookService";
import type { BookSummary, PaginatedResponse, ApiError } from "../types";

type PaginationInfo = Omit<PaginatedResponse<BookSummary>, "content">;

interface UseSearchBooksReturn {
	results: BookSummary[];
	pagination: PaginationInfo;
	isLoading: boolean;
	error: string | null;
	search: (keywords: string, libraryIds?: number[], genreIds?: number[], page?: number, size?: number, startYear?: number | null, endYear?: number | null, formatTypes?: string[], minRating?: number) => Promise<void>;
	clearError: () => void;
}

export function useSearchBooks(): UseSearchBooksReturn {
	const [results, setResults] = useState<BookSummary[]>([]);

	const [pagination, setPagination] = useState<PaginationInfo>({
		pageNumber: 0,
		pageSize: 12,
		totalElements: 0,
		totalPages: 0,
		isFirst: true,
		isLast: true,
		hasNext: false,
		hasPrevious: false,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useCallback(
		async (
			keywords: string,
			libraryIds: number[] = [],
			genreIds: number[] = [],
			page: number = 0,
			size: number = 12,
			startYear: number | null = null,
			endYear: number | null = null,
			formatTypes: string[] = [],
			minRating: number = 0,
		): Promise<void> => {
			if (
				!keywords.trim() &&
				libraryIds.length === 0 &&
				genreIds.length === 0 &&
				minRating <= 0 &&
				!startYear &&
				!endYear &&
				formatTypes.length === 0
			) {
				setResults([]);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				const response = await searchBooks(keywords.trim(), {
					page,
					size,
					libraryIds,
					genreIds,
					startYear: startYear || undefined,
					endYear: endYear || undefined,
					formatTypes: formatTypes.length > 0 ? formatTypes : undefined,
					minRating: minRating > 0 ? minRating : undefined
				});

				setResults(response.content);
				setPagination({
					pageNumber: response.pageNumber,
					pageSize: response.pageSize,
					totalElements: response.totalElements,
					totalPages: response.totalPages,
					isFirst: response.isFirst,
					isLast: response.isLast,
					hasNext: response.hasNext,
					hasPrevious: response.hasPrevious,
				});
			} catch (err) {
				const apiError = err as ApiError;
				setError(apiError.message || "Búsqueda fallida");
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => setError(null), []);

	return {
		results,
		pagination,
		isLoading,
		error,
		search,
		clearError,
	};
}
