import { useState, useCallback } from "react";
import { getBooksByGenre, getBooksByGenres } from "../services/bookService";
import type { BookSummary, PaginatedResponse, ApiError } from "../types";

type PaginationInfo = Omit<PaginatedResponse<BookSummary>, "content">;

interface UseBooksByGenreReturn {
	books: BookSummary[];
	pagination: PaginationInfo;
	isLoading: boolean;
	error: string | null;
	fetchByGenre: (
		genreId: number,
		page?: number,
		size?: number,
	) => Promise<void>;
	fetchByGenres: (
		genreIds: number[],
		page?: number,
		size?: number,
	) => Promise<void>;
	clearError: () => void;
}

export function useBooksByGenre(): UseBooksByGenreReturn {
	const [books, setBooks] = useState<BookSummary[]>([]);

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

	const fetchByGenre = useCallback(
		async (
			genreId: number,
			page: number = 0,
			size: number = 12,
		): Promise<void> => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await getBooksByGenre(genreId, { page, size });

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
				setError(apiError.message || "Failed to fetch books by genre");
				setBooks([]);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const fetchByGenres = useCallback(
		async (
			genreIds: number[],
			page: number = 0,
			size: number = 12,
		): Promise<void> => {
			if (genreIds.length === 0) {
				setBooks([]);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				const response = await getBooksByGenres(genreIds, {
					page,
					size,
				});

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
				setError(apiError.message || "Failed to fetch books by genres");
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
		fetchByGenre,
		fetchByGenres,
		clearError,
	};
}
