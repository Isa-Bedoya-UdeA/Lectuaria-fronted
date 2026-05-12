import { useState, useCallback, useEffect, useRef } from "react";
import { getBooks } from "../services/bookService";
import type {
	BookSummary,
	PaginatedResponse,
	BookQueryParams,
	ApiError,
} from "../types";

type PaginationInfo = Omit<PaginatedResponse<BookSummary>, "content">;

interface UseBooksReturn {
	books: BookSummary[];
	pagination: PaginationInfo;
	isLoading: boolean;
	error: string | null;
	fetchBooks: (params?: BookQueryParams) => Promise<void>;
	clearError: () => void;
}

export function useBooks(initialParams: BookQueryParams = {}): UseBooksReturn {
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

	const fetchBooks = useCallback(
		async (params: BookQueryParams = {}): Promise<void> => {
			try {
				setIsLoading(true);
				setError(null);

				const mergedParams = { ...initialParamsRef.current, ...params };
				const response = await getBooks(mergedParams);

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
				setError(apiError.message || "Failed to fetch books");
				setBooks([]);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		const hasInitialParams =
			Object.keys(initialParamsRef.current).length > 0;
		if (hasInitialParams) {
			fetchBooks(initialParamsRef.current);
		}
	}, []);

	const clearError = useCallback(() => setError(null), []);

	return {
		books,
		pagination,
		isLoading,
		error,
		fetchBooks,
		clearError,
	};
}
