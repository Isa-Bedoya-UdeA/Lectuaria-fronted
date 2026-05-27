import { createContext, useContext, useState, type ReactNode, useCallback } from "react";
import { getBooks, getBookById, searchBooks, getBooksByGenre, getBooksByGenres } from "../services/bookService";
import type { BookSummary, BookDetail, BookQueryParams, ApiError } from "../types";

interface BooksContextType {
    books: BookSummary[];
    currentBook: BookDetail | null;
    isLoading: boolean;
    isLoadingDetail: boolean;
    error: string | null;
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    fetchBooks: (params?: BookQueryParams) => Promise<void>;
    fetchBookDetail: (id: number) => Promise<void>;
    searchBooks: (keywords: string, params?: Omit<BookQueryParams, "keywords">) => Promise<void>;
    fetchByGenre: (genreId: number, params?: Omit<BookQueryParams, "genreId">) => Promise<void>;
    fetchByGenres: (genreIds: number[], params?: Omit<BookQueryParams, "genreIds">) => Promise<void>;
    clearCurrentBook: () => void;
    clearError: () => void;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export const BooksProvider = ({ children }: { children: ReactNode }) => {
    const [books, setBooks] = useState<BookSummary[]>([]);
    const [currentBook, setCurrentBook] = useState<BookDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });

    const fetchBooks = useCallback(async (params: BookQueryParams = {}): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getBooks(params);

            setBooks(response.content);
            setPagination({
                pageNumber: response.pageNumber,
                pageSize: response.pageSize,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
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
    }, []);

    const fetchBookDetail = useCallback(async (id: number): Promise<void> => {
        try {
            setIsLoadingDetail(true);
            setError(null);

            const book = await getBookById(id);
            setCurrentBook(book);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || "Book not found");
            setCurrentBook(null);
        } finally {
            setIsLoadingDetail(false);
        }
    }, []);

    const searchBooksHandler = useCallback(async (
        keywords: string,
        params: Omit<BookQueryParams, "keywords"> = {}
    ): Promise<void> => {
        if (!keywords.trim()) {
            setBooks([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await searchBooks(keywords.trim(), params);

            setBooks(response.content);
            setPagination({
                pageNumber: response.pageNumber,
                pageSize: response.pageSize,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                hasNext: response.hasNext,
                hasPrevious: response.hasPrevious,
            });
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || "Search failed");
            setBooks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchByGenre = useCallback(async (
        genreId: number,
        params: Omit<BookQueryParams, "genreId"> = {}
    ): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getBooksByGenre(genreId, params);

            setBooks(response.content);
            setPagination({
                pageNumber: response.pageNumber,
                pageSize: response.pageSize,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
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
    }, []);

    const fetchByGenres = useCallback(async (
        genreIds: number[],
        params: Omit<BookQueryParams, "genreIds"> = {}
    ): Promise<void> => {
        if (genreIds.length === 0) {
            setBooks([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getBooksByGenres(genreIds, params);

            setBooks(response.content);
            setPagination({
                pageNumber: response.pageNumber,
                pageSize: response.pageSize,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
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
    }, []);

    const clearCurrentBook = useCallback(() => setCurrentBook(null), []);
    const clearError = useCallback(() => setError(null), []);

    return (
        <BooksContext.Provider
            value={{
                books,
                currentBook,
                isLoading,
                isLoadingDetail,
                error,
                pagination,
                fetchBooks,
                fetchBookDetail,
                searchBooks: searchBooksHandler,
                fetchByGenre,
                fetchByGenres,
                clearCurrentBook,
                clearError,
            }}
        >
            {children}
        </BooksContext.Provider>
    );
};

export const useBooksContext = () => {
    const context = useContext(BooksContext);
    if (context === undefined) {
        throw new Error("useBooksContext must be used within a BooksProvider");
    }
    return context;
};