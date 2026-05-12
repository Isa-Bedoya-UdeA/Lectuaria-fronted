// Genre with description (for hover tooltips)
export interface Genre {
	id: number;
	name: string;
	description?: string;
}

// Author (simplified)
export interface Author {
	id: number;
	name: string;
}

// Publisher (simplified)
export interface Publisher {
	id: number;
	name: string;
}

// Library info for filters and cards
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
}

// Book summary for cards/list views
export interface BookSummary {
	id: number;
	isbn: number;
	title: string;
	authors: string[];
	genres: Genre[];
	averageRating: number;
	ratingsCount: number;
	coverUrl?: string;
	libraryId?: number; // ID de la biblioteca que creó el libro
	userAddedId?: number; // ID del usuario que añadió el libro a la biblioteca
	createdById?: number; // ID del usuario que creó el libro originalmente
    availableLibraries?: string[]; // Nombres de bibliotecas donde está disponible
}

// Book detail view (extends summary)
export interface BookDetail extends BookSummary {
	description?: string;
	publishers: string[];
	publicationDate?: string; // ISO date string
	pages?: number;
	isbn: number;
	formats?: string[];
    availability?: LibraryAvailability[];
}

// Availability for library book publishing
export interface Availability {
	physical: boolean;
	digital: boolean;
	physicalCopies?: number;
	digitalPlatform?: string;
}

// Book publish request (for librarians)
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
	libraryId: number;
}

// Book publish response
export interface BookPublishResponse {
	bookId: number;
	title: string;
	isbn: number;
	isNewBook: boolean;
	message: string;
}

// Prefill response from external APIs (Google Books first, OpenLibrary fallback - partial book data)
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

// Bulk Upload Result
export interface BulkUploadResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    successes: BookPublishResponse[];
}

// Paginated response wrapper (for book lists)
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

// Search/Filter query parameters
export interface BookQueryParams {
	page?: number;
	size?: number;
	keyword?: string; // For search
	keywords?: string; // For multi-keyword search (comma-separated)
	genreId?: number; // For single genre filter
	genreIds?: number[]; // For multiple genres filter (OR logic)
	authorId?: number;
	minRating?: number;
    libraryIds?: number[]; // For library filter
    startYear?: number; // For year range filter
    endYear?: number; // For year range filter
    formatTypes?: string[]; // For format filter (array of "physical" and/or "digital")
}
