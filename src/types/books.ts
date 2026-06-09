export interface Genre {
	id: number;
	name: string;
	description?: string;
}

export interface Author {
	id: number;
	name: string;
}

export interface Publisher {
	id: number;
	name: string;
}

export interface LibrarySummary {
    id: number;
    name: string;
    description: string;
    address: string;
    email: string;
    phone: string;
    openingHours: string;
    zoneName?: string;
}

export interface LibraryAvailability {
    library: LibrarySummary;
    physicalAvailable: boolean;
    physicalCopies?: number;
    digitalAvailable: boolean;
    digitalPlatform?: string;
    platformId?: number;
}

export interface BookSummary {
	id: number;
	isbn: number;
	title: string;
	authors: string[];
	genres: Genre[];
	averageRating: number;
	ratingsCount: number;
	coverUrl?: string;
	libraryId?: number;
	userAddedId?: number;
	createdById?: number;
    availableLibraries?: string[];
    createdAt?: string;
}

export interface BookDetail extends BookSummary {
	description?: string;
	publishers: string[];
	publicationDate?: string; // ISO date string
	pages?: number;
	isbn: number;
	formats?: string[];
    availability?: LibraryAvailability[];
}

export interface Availability {
	physical: boolean;
	digital: boolean;
	physicalCopies?: number;
}

export interface BookPublishRequest {
	isbn: number;
	title: string;
	authors: string[];
	description?: string;
	genres: string[];
	coverUrl?: string;
	publishers: string[];
	publicationDate?: string; // ISO date string
	pages?: number;
	availability: Availability;
	availabilityMode?: 'physical' | 'digital' | 'both';
	platformId?: number;
	libraryId: number;
}

export interface BookPublishResponse {
	bookId: number;
	title: string;
	isbn: number;
	isNewBook: boolean;
	message: string;
}

export interface BookPrefillData {
	isbn: number;
	title: string;
	authors: string[];
	genres?: string[];
	publishers?: string[];
	pages?: number;
	publicationDate?: string;
	coverUrl?: string;
	description?: string | null;
	bookExistsInCatalog: boolean;
	bookExistsInUserLibrary: boolean;
}

export interface BulkUploadResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    successes: BookPublishResponse[];
}

export interface ZipUploadResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}

export interface PaginatedResponse<T> {
	content: T[];
	pageNumber: number;
	pageSize: number;
	totalElements: number;
	totalPages: number;
	isFirst: boolean;
	isLast: boolean;
	hasNext: boolean;
	hasPrevious: boolean;
}

export interface BookQueryParams {
	page?: number;
	size?: number;
	keyword?: string;
	keywords?: string;
	sort?: string;
	genreId?: number;
	genreIds?: number[];
	authorId?: number;
	minRating?: number;
    libraryIds?: number[];
    /**
     * El controller /books/search del backend espera minYear/maxYear
     * (no startYear/endYear). Se mantienen los alias para compatibilidad.
     */
    minYear?: number;
    maxYear?: number;
    startYear?: number;
    endYear?: number;
    year?: number;
    formatTypes?: string[];
}

export interface FeaturedSections {
    mostReadThisMonth: BookSummary[];
    topRated: BookSummary[];
    nextUpdateAt: string;
}

export interface PopularLibraryBookDTO {
    book: BookSummary;
    interactions: number;
    reviewsCount: number;
    ratingsCount: number;
}

export interface LibraryStatisticsDTO {
    totalBooks: number;
    booksAddedThisMonth: number;
    mostRepresentedGenres: import("./userProfile").GenreCountDTO[];
    reviewsOnOwnBooks: number;
    averageRatingOfOwnBooks: number;
    mostPopularBooks: PopularLibraryBookDTO[];
    updatedAt: string;
    nextRefreshAt: string;
}
