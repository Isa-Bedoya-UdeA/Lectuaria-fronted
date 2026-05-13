import api from "../config/api";
import type { BookSummary, PaginatedResponse, BookQueryParams } from "../types";

/**
 * Get new books added in the last 30 days
 */
export const getNewBooks = async (
    params: BookQueryParams = {}
): Promise<PaginatedResponse<BookSummary>> => {
    try {
        // Use the existing books endpoint with sort parameter for newest books
        const response = await api.get<PaginatedResponse<BookSummary>>(
            "/books",
            {
                params: {
                    ...params,
                    sort: "newest" // Sort by newest first
                },
                paramsSerializer: {
                    indexes: null, // Don't use brackets for array parameters
                }
            }
        );
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: any } };
        throw apiError.response?.data || { message: "Failed to fetch new books" };
    }
};
