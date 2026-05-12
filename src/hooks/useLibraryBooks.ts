import { useState, useCallback, useRef } from "react";
import { getBooksByLibrary } from "../services/bookService";
import type {
	BookSummary,
	PaginatedResponse,
	BookQueryParams,
	ApiError,
} from "../types";

type PaginationInfo = Omit<PaginatedResponse<BookSummary>, "content">;

interface UseLibraryBooksReturn {
	books: BookSummary[];
	pagination: PaginationInfo;
	isLoading: boolean;
	error: string | null;
	fetchLibraryBooks: (libraryId: number, params?: BookQueryParams) => Promise<void>;
	clearError: () => void;
}

export function useLibraryBooks(initialParams: BookQueryParams = {}): UseLibraryBooksReturn {
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

	const initialParamsRef = useRef(initialParams);

	const fetchLibraryBooks = useCallback(
		async (libraryId: number, params: BookQueryParams = {}): Promise<void> => {
			if (!libraryId) return;
			try {
				setIsLoading(true);
				setError(null);

				const mergedParams = { ...initialParamsRef.current, ...params };
				const response = await getBooksByLibrary(libraryId, mergedParams);

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
				setError(apiError.message || "Failed to fetch library books");
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
		fetchLibraryBooks,
		clearError,
	};
}
