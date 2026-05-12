import {
	type BookDetail as Book,
	type Author,
	type Publisher as Editorial,
	type Genre,
	type Review,
	type ProfileResponse as User,
} from "@/types";
0;
interface RawBook {
	id: number;
	cover: string[];
	title: string;
	description: string;
	averageRating: number;
	authors: number[];
	genres: number[];
	editorial: number[];
	reviews: number[];
	numGrades: number;
	date: string;
	pages: number;
	ISBN: string;
	libraryId: string[];
	createdBy: string;
}

export function mapBooksData(
	books: RawBook[],
	authors: Author[],
	genres: Genre[],
	editorials: Editorial[],
	reviews: any[], // Raw reviews from JSON
	users: User[],
): Book[] {
	return books.map((book) => {
		const mappedReviews: Review[] = (book.reviews || [])
			.map((reviewId) => {
				// Let's assume the ID in reviews.json is what matches the index or ID in reviews array.
				// Based on reviews.json, IDs are "1", "2", etc.
				const review = reviews.find(
					(r) => Number(r.id) === reviewId + 1,
				);
				if (!review) return null;

				const user = users.find((u) => u.id === review.userId);
				return {
					...review,
					user: user || {
						id: "",
						name: "Usuario Desconocido",
						username: "@unknown",
						email: "",
						avatar: "",
					},
					date: new Date(review.createdAt),
				};
			})
			.filter(Boolean) as Review[];

		return {
			...book,
			covers: (book.cover || []).filter((c) => c !== ""),
			authors: book.authors
				.map((id) => authors.find((a) => a.id === id))
				.filter(Boolean) as Author[],
			genres: book.genres
				.map((id) => genres.find((g) => g.id === id))
				.filter(Boolean) as Genre[],
			editorial: book.editorial
				.map((id) => editorials.find((e) => e.id === id))
				.filter(Boolean) as Editorial[],
			reviews: mappedReviews,
			date: new Date(book.date),
			libraryId: book.libraryId || [],
			createdBy: book.createdBy || "",
		} as unknown as Book;
	});
}
