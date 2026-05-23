import api from "../config/api";
import axios from "axios";
import type {
	BookSummary,
	BookDetail,
	BookPublishRequest,
	BookPublishResponse,
	BookPrefillData,
	PaginatedResponse,
	BookQueryParams,
	ApiError,
} from "../types";

// Create public API instance without auth interceptors
const publicApi = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

/**
 * Get paginated list of books
 */
export const getBooks = async (
	params: BookQueryParams = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			"/books",
			{
				params,
				paramsSerializer: {
					indexes: null, // Don't use brackets for array parameters: formatTypes=physical&formatTypes=digital
				}
			},
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch books" };
	}
};

/**
 * Get book details by ID
 */
export const getBookById = async (id: number): Promise<BookDetail> => {
	try {
		const response = await api.get<BookDetail>(`/books/${id}`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as {
			response?: { status?: number; data?: ApiError };
		};

		// Si es un error 401 (no autenticado), intentar con API pública
		if (apiError.response?.status === 401) {
			try {
				const publicResponse = await publicApi.get<BookDetail>(
					`/books/${id}`,
				);
				return publicResponse.data;
			} catch (publicError) {
				const publicApiError = publicError as {
					response?: { data?: ApiError };
				};
				throw (
					publicApiError.response?.data || {
						message: "Book not found",
					}
				);
			}
		}

		throw apiError.response?.data || { message: "Book not found" };
	}
};

/**
 * Get book details by ISBN
 */
export const getBookByIsbn = async (isbn: number): Promise<BookDetail> => {
	try {
		const response = await api.get<BookDetail>(`/books/isbn/${isbn}`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as {
			response?: { status?: number; data?: ApiError };
		};

		// Si es un error 401 (no autenticado), intentar con API pública
		if (apiError.response?.status === 401) {
			try {
				const publicResponse = await publicApi.get<BookDetail>(
					`/books/isbn/${isbn}`,
				);
				return publicResponse.data;
			} catch (publicError) {
				const publicApiError = publicError as {
					response?: { data?: ApiError };
				};
				throw (
					publicApiError.response?.data || {
						message: "Book not found",
					}
				);
			}
		}

		throw apiError.response?.data || { message: "Book not found" };
	}
};

/**
 * Search books by keywords (title, author, or genre)
 */
export const searchBooks = async (
	keywords: string,
	params: Omit<BookQueryParams, "keywords"> = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			"/books/search",
			{
				params: { ...params, keywords },
			},
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as {
			response?: { status?: number; data?: ApiError };
		};

		// Fallback to public API for unauthenticated users
		if (
			apiError.response?.status === 401 ||
			apiError.response?.status === 403
		) {
			try {
				const publicResponse = await publicApi.get<
					PaginatedResponse<BookSummary>
				>("/books/search", {
					params: { ...params, keywords },
				});
				return publicResponse.data;
			} catch (publicError) {
				const publicApiError = publicError as {
					response?: { data?: ApiError };
				};
				throw (
					publicApiError.response?.data || {
						message: "Search failed",
					}
				);
			}
		}

		throw apiError.response?.data || { message: "Search failed" };
	}
};

/**
 * Filter books by single genre
 */
export const getBooksByGenre = async (
	genreId: number,
	params: Omit<BookQueryParams, "genreId"> = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			`/books/genre/${genreId}`,
			{ params },
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch books by genre",
			}
		);
	}
};

/**
 * Filter books by library
 */
export const getBooksByLibrary = async (
	libraryId: number,
	params: Omit<BookQueryParams, "libraryId"> = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			`/books/library/${libraryId}`,
			{ params },
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch library books",
			}
		);
	}
};

/**
 * Filter books by multiple genres (OR logic)
 */
export const getBooksByGenres = async (
	genreIds: number[],
	params: Omit<BookQueryParams, "genreIds"> = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			"/books/genres",
			{
				params: { ...params, genreIds },
			},
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch books by genres",
			}
		);
	}
};

/**
 * Get top-rated books
 */
export const getTopRatedBooks = async (
	params: BookQueryParams = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			"/books/top-rated",
			{ params },
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch top-rated books",
			}
		);
	}
};

/**
 * Prefill book data from OpenLibrary via backend
 */
export const prefillBookFromIsbn = async (
	isbn: number,
): Promise<BookPrefillData> => {
	try {
		const response = await api.get<BookPrefillData>(
			`/books/prefill/${isbn}`,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch book data from OpenLibrary",
			}
		);
	}
};

/**
 * Publish a book (librarians only)
 */
export const publishBook = async (
	data: BookPublishRequest,
): Promise<BookPublishResponse> => {
	try {
		// Validate required fields
		if (
			!data.isbn ||
			!data.title ||
			data.authors.length === 0 ||
			!data.availability
		) {
			throw { message: "Missing required fields for book publication" };
		}

		const response = await api.post<BookPublishResponse>(
			"/books/publish",
			data,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to publish book" };
	}
};

export const getPopularBooks = async (
	params: Omit<
		BookQueryParams,
		"keyword" | "keywords" | "genreId" | "genreIds"
	> = {},
): Promise<PaginatedResponse<BookSummary>> => {
	try {
		const response = await api.get<PaginatedResponse<BookSummary>>(
			"/books/popular",
			{ params },
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to fetch popular books",
			}
		);
	}
};

/**
 * Remove a book from the user's library
 */
export const removeBookFromLibrary = async (
	bookId: number,
): Promise<string> => {
	try {
		const response = await api.delete<string>(`/books/${bookId}/library`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw (
			apiError.response?.data || {
				message: "Failed to remove book from library",
			}
		);
	}
};

/**
 * Delete a book completely (Admin)
 */
export const deleteBook = async (bookId: number): Promise<string> => {
	try {
		const response = await api.delete<string>(`/books/${bookId}`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to delete book" };
	}
};

/**
 * Update a book (Creator or Admin)
 */
export const updateBook = async (
	bookId: number,
	data: BookPublishRequest,
): Promise<BookDetail> => {
	try {
		const response = await api.put<BookDetail>(`/books/${bookId}`, data);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to update book" };
	}
};

/**
 * Update a book with an optional cover image file (multipart/form-data).
 * Used when librarian re-uploads a local image during edit.
 */
export const updateBookWithCover = async (
	bookId: number,
	data: BookPublishRequest,
	coverFile?: File | null,
): Promise<BookDetail> => {
	try {
		if (coverFile) {
			// Encode cover file as data URL so it can be sent as JSON
			data.coverUrl = await fileToBase64(coverFile);
		}
		const response = await api.put<BookDetail>(`/books/${bookId}`, data);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to update book" };
	}
};

const fileToBase64 = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

export const getFeaturedSections = async (): Promise<import("../types").FeaturedSections> => {
	try {
		const response = await api.get<import("../types").FeaturedSections>("/books/featured");
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch featured sections" };
	}
};

export const getSimilarBooks = async (bookId: number): Promise<BookSummary[]> => {
	try {
		const response = await api.get<BookSummary[]>(`/books/${bookId}/similar`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch similar books" };
	}
};
