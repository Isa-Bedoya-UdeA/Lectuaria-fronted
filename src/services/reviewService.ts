import api from "../config/api";
import { unwrapEntity, unwrapPaged } from "./apiHateoas";
import type { Review, ReviewUpsertRequest } from "@/types";

export const getBookReviews = async (
	bookId: number,
	page: number = 0,
	size: number = 10,
	sort: string = "most_recent",
): Promise<Review[]> => {
	try {
		const response = await api.get(`/books/${bookId}/reviews`, {
			params: { page, size, sort },
		});

		const paged = unwrapPaged<any>(response);
		const data = paged.content || [];

		return data.map((dto: any) => ({
			id: dto.reviewId.toString(),
			bookId: dto.bookId,
			userId: dto.authorId,
			userName: dto.authorName,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
			rating: dto.rating,
			reviewText: dto.reviewText,
			status: dto.status,
			helpfulCount: dto.helpfulCount,
			isOwnReview: false,
		}));
	} catch (error) {
		console.error("Error fetching book reviews:", error);
		return [];
	}
};

export const saveReview = async (
	bookId: number,
	request: ReviewUpsertRequest,
): Promise<Review> => {
	const response = await api.post(`/books/${bookId}/reviews`, request);
	return unwrapEntity<Review>(response);
};

export const updateReview = async (
	reviewId: string,
	request: ReviewUpsertRequest,
): Promise<Review> => {
	const response = await api.put(`/books/reviews/${reviewId}`, request);
	return unwrapEntity<Review>(response);
};

export const deleteReview = async (reviewId: string): Promise<void> => {
	await api.delete(`/books/reviews/${reviewId}`);
};