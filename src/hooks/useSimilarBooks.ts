import { useState, useCallback } from "react";
import { getSimilarBooks } from "@/services/bookService";
import type { BookSummary } from "@/types";

export const useSimilarBooks = () => {
    const [books, setBooks] = useState<BookSummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSimilarBooks = useCallback(async (bookId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getSimilarBooks(bookId);
            setBooks(data);
        } catch (err: any) {
            console.error("Error fetching similar books:", err);
            setError(err.message || "Failed to fetch similar books");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        books,
        isLoading,
        error,
        fetchSimilarBooks,
        clearError
    };
};
