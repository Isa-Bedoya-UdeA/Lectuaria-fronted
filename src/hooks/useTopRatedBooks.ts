import { useState, useCallback } from "react";
import { getTopRatedBooks } from "@/services/bookService";
import type { BookSummary, BookQueryParams } from "@/types";

export const useTopRatedBooks = () => {
    const [books, setBooks] = useState<BookSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);

    const fetchTopRatedBooks = useCallback(async (params: BookQueryParams = {}) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getTopRatedBooks(params);
            setBooks(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err: any) {
            console.error("Error fetching top rated books:", err);
            setError(err.message || "Failed to fetch top rated books");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        books,
        isLoading,
        error,
        totalPages,
        totalElements,
        fetchTopRatedBooks,
        clearError
    };
};
