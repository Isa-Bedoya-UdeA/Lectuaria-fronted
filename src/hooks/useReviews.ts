import { useState, useCallback } from "react";
import {
	getBookReviews,
	saveReview as createReview,
	updateReview as modifyReview,
	deleteReview as removeReview,
} from "../services/reviewService";
import type { Review, ReviewUpsertRequest } from "@/types";

interface UseReviewsReturn {
	reviews: Review[];
	isLoading: boolean;
	error: string | null;
	fetchReviews: (bookId: number) => Promise<void>;
	addReview: (bookId: number, request: ReviewUpsertRequest) => Promise<void>;
	updateReview: (
		reviewId: string,
		request: ReviewUpsertRequest,
	) => Promise<void>;
	deleteReview: (reviewId: string) => Promise<void>;
	clearError: () => void;
}

export function useReviews(): UseReviewsReturn {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchReviews = useCallback(async (bookId: number): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getBookReviews(bookId);
			setReviews(data);
		} catch (err) {
			setError((err as Error).message || "Error loading reviews");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const addReview = async (bookId: number, request: ReviewUpsertRequest) => {
		try {
			setIsLoading(true);
			await createReview(bookId, request);
			await fetchReviews(bookId);
		} catch (err) {
			setError((err as Error).message || "Error adding review");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const updateReview = async (
		reviewId: string,
		request: ReviewUpsertRequest,
	) => {
		try {
			setIsLoading(true);
			await modifyReview(reviewId, request);
			// Podríamos refrescar o actualizar localmente. Refrescar es más seguro.
			// Nota: El hook no sabe el bookId actual. Podríamos requerirlo si queremos refrescar.
		} catch (err) {
			setError((err as Error).message || "Error updating review");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const deleteReview = async (reviewId: string) => {
		try {
			setIsLoading(true);
			await removeReview(reviewId);
			setReviews((prev) => prev.filter((r) => r.id !== reviewId));
		} catch (err) {
			setError((err as Error).message || "Error deleting review");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const clearError = useCallback(() => setError(null), []);

	return {
		reviews,
		isLoading,
		error,
		fetchReviews,
		addReview,
		updateReview,
		deleteReview,
		clearError,
	};
}

