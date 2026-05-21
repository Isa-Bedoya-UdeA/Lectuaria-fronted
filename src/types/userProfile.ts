// Types for user profile viewing (US-0016)

export type FriendshipStatus = "NONE" | "PENDING" | "ACCEPTED" | "SELF";

export interface UserStatsDTO {
    booksRead: number;
    reviewsCount: number;
    friendsCount: number;
    listsCount: number;
}

export interface UserProfileDTO {
    id: number;
    fullName: string;
    username: string;
    photoUrl?: string;
    biography?: string;
    friendshipStatus: FriendshipStatus;
    stats: UserStatsDTO;
}

export interface UserReviewDTO {
    id: string;
    userId: number;
    userName: string;
    rating: number;
    reviewText: string;
    createdAt: string;
    updatedAt: string;
    status: "draft" | "published" | "hidden" | "DRAFT" | "PUBLISHED";
    helpfulCount: number;
    bookTitle: string;
    bookId: number;
}

export interface GenreCountDTO {
    genreId: number;
    genreName: string;
    count: number;
}

export interface MonthlyBooksReadDTO {
    month: string;
    booksRead: number;
}

export interface YearComparisonDTO {
    currentYear: number;
    currentYearBooks: number;
    previousYear: number;
    previousYearBooks: number;
    difference: number;
}

export interface ReadingStatisticsDTO {
    totalBooksRead: number;
    reviewsCount: number;
    mostReadGenres: GenreCountDTO[];
    booksReadByMonth: MonthlyBooksReadDTO[];
    yearComparison: YearComparisonDTO;
    updatedAt: string;
}

export interface SocialStatisticsDTO {
    friendsCount: number;
    listsSharedByFriends: number;
    listsIShared: number;
    booksSharedWithFriends: number;
    booksSharedByFriends: number;
    updatedAt: string;
}
