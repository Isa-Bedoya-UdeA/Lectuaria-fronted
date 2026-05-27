import { useState, useCallback } from "react";

import { getBookByIsbn } from "../services/bookService";

import type { BookDetail } from "../types";

interface UseBookDetailReturn {

	book: BookDetail | null;

	isLoading: boolean;

	error: string | null;

	fetchBook: (isbn: number) => Promise<void>;

	clearError: () => void;

}



export function useBookDetail(): UseBookDetailReturn {

	const [book, setBook] = useState<BookDetail | null>(null);

	const [isLoading, setIsLoading] = useState(false);

	const [error, setError] = useState<string | null>(null);



	const fetchBook = useCallback(async (isbn: number): Promise<void> => {

try {

			setIsLoading(true);
			setError(null);



			const data = await getBookByIsbn(isbn);

			setBook(data);

		} catch (err) {

			const apiError = err as { message?: string; isPublic?: boolean };

			



			if (apiError.isPublic) {

				try {

					const publicData = await getBookByIsbn(isbn);

					setBook(publicData);

				} catch (publicErr) {

					const publicApiError = publicErr as { message?: string };

					setError(publicApiError.message || "Book not found");

					setBook(null);

				}

			} else {

				setError(apiError.message || "Book not found");

				setBook(null);

			}

		} finally {

			setIsLoading(false);

		}

	}, []);



	const clearError = useCallback(() => setError(null), []);



	return {

		book,

		isLoading,

		error,

		fetchBook,

		clearError,

	};

}

