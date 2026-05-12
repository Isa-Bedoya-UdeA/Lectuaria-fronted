import { useState, useCallback } from "react";
import { getPopularBooks } from "../services/bookService";
import type {
	BookSummary,
	PaginatedResponse,
	ApiError,
	BookQueryParams,
} from "../types";

interface UsePopularBooksReturn {
	books: BookSummary[];
	pagination: Omit<PaginatedResponse<BookSummary>, "content">;
	isLoading: boolean;
	error: string | null;
	fetchPopularBooks: (
		params?: Omit<
			BookQueryParams,
			"keyword" | "keywords" | "genreId" | "genreIds"
		>,
	) => Promise<void>;
	clearError: () => void;
}

export function usePopularBooks(): UsePopularBooksReturn {
	const [books, setBooks] = useState<BookSummary[]>([]);
	const [pagination, setPagination] = useState<
		Omit<PaginatedResponse<BookSummary>, "content">
	>({
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

	const fetchPopularBooks = useCallback(
		async (
			params: Omit<
				BookQueryParams,
				"keyword" | "keywords" | "genreId" | "genreIds"
			> = {},
		): Promise<void> => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await getPopularBooks(params);

				setBooks(response.content);
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
				setError(apiError.message || "Failed to fetch popular books");
				setBooks([]);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => setError(null), []);

	return {
		books,
		pagination,
		isLoading,
		error,
		fetchPopularBooks,
		clearError,
	};
}
