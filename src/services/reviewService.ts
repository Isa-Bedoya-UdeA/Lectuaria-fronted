import api from "../config/api";
import type { Review, ReviewUpsertRequest } from "@/types";

/**
 * Responde con una página de reseñas publicadas.
 * El backend devuelve un PaginatedResponse<BookReviewResponseDTO>.
 */
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

		// Mapear el DTO del backend (BookReviewResponseDTO) a nuestra interfaz Review
		// El backend devuelve { content, pageNumber, pageSize, ... } por el PaginatedResponse
		const data = response.data.content || [];

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
			isOwnReview: false, // Se calculará en el componente comparando con user.id
		}));
	} catch (error) {
		console.error("Error fetching book reviews:", error);
		return [];
	}
};

/**
 * Guarda o publica una nueva reseña para un libro.
 */
export const saveReview = async (
	bookId: number,
	request: ReviewUpsertRequest,
): Promise<Review> => {
	const response = await api.post(`/books/${bookId}/reviews`, request);
	return response.data;
};

/**
 * Actualiza una reseña existente.
 */
export const updateReview = async (
	reviewId: string,
	request: ReviewUpsertRequest,
): Promise<Review> => {
	const response = await api.put(`/books/reviews/${reviewId}`, request);
	return response.data;
};

/**
 * Elimina una reseña escrita.
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
	await api.delete(`/books/reviews/${reviewId}`);
};
