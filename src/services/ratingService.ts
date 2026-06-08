import api from "@/config/api";
import { unwrapEntity } from "./apiHateoas";

export interface RatingRequest {
	rating: number;
}

export interface RatingResponse {
	message: string;
	bookId: number;
	userRating: number;
	averageRating: number;
	ratingsCount: number;
	reviewId?: number;
	reviewText?: string;
	reviewStatus?: string;
}

export const ratingService = {
	async rateBook(bookId: number, rating: number): Promise<RatingResponse> {
		const response = await api.put(`/books/${bookId}/rating`, { rating });
		return unwrapEntity<RatingResponse>(response);
	},

	async getUserRating(bookId: number): Promise<RatingResponse> {
		const response = await api.get(`/books/${bookId}/rating`);
		return unwrapEntity<RatingResponse>(response);
	},

	async deleteRating(bookId: number): Promise<void> {
		await api.delete(`/books/${bookId}/interaction`);
	},
};