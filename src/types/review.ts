export interface Review {
	id: string;
	bookId: number;
	userId: number;
	userName: string;
	createdAt: string;
	updatedAt: string;
	rating: number;
	reviewText: string;
	status: "draft" | "published" | "hidden" | "DRAFT" | "PUBLISHED";
	helpfulCount: number;
	isOwnReview?: boolean;
}

export interface ReviewUpsertRequest {
	rating: number;
	reviewText: string;
	publish: boolean;
}
