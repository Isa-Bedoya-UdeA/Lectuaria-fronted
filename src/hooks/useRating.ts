import { useState, useEffect } from "react";
import { ratingService } from "@/services/ratingService";
import { useAuth } from "@/context/AuthContext";

export const useRating = (bookId: number) => {
    const [userRating, setUserRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [ratingsCount, setRatingsCount] = useState<number>(0);
    const [reviewId, setReviewId] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState<string>("");
    const [reviewStatus, setReviewStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (bookId && user) {
            loadUserRating();
        } else {
            setUserRating(0);
            setAverageRating(0);
            setRatingsCount(0);
            setReviewId(null);
            setReviewText("");
            setReviewStatus(null);
        }
    }, [bookId, user]);

    const loadUserRating = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await ratingService.getUserRating(bookId);
            setUserRating(response.userRating || 0);
            setAverageRating(response.averageRating || 0);
            setRatingsCount(response.ratingsCount || 0);
            setReviewId(response.reviewId || null);
            setReviewText(response.reviewText || "");
            setReviewStatus(response.reviewStatus || null);
        } catch (err: any) {
            if (err?.response?.status !== 401 && err?.response?.status !== 403) {
                console.error("Error loading user rating:", err);
            }
            setError(err.response?.data?.message || "Error al cargar calificación");
        } finally {
            setIsLoading(false);
        }
    };

    const rateBook = async (rating: number): Promise<boolean> => {
        if (!user) {
            setError("Debes estar logueado para calificar");
            return false;
        }

        if (rating < 1 || rating > 5) {
            setError("La calificación debe estar entre 1 y 5 estrellas");
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await ratingService.rateBook(bookId, rating);
            setUserRating(response.userRating || 0);
            setAverageRating(response.averageRating || 0);
            setRatingsCount(response.ratingsCount || 0);
            setReviewId(response.reviewId || null);
            setReviewText(response.reviewText || "");
            setReviewStatus(response.reviewStatus || null);
            return true;
        } catch (err: any) {
            console.error("Error rating book:", err);
            setError(err.response?.data?.message || "Error al calificar libro");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        userRating,
        averageRating,
        ratingsCount,
        reviewId,
        reviewText,
        reviewStatus,
        isLoading,
        error,
        rateBook,
        loadUserRating,
        clearError
    };
};