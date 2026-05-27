import api from "../config/api";
import type { BookSummary, PaginatedResponse, BookQueryParams } from "../types";

export const getNewBooks = async (
    params: BookQueryParams = {}
): Promise<PaginatedResponse<BookSummary>> => {
    try {
        const response = await api.get<PaginatedResponse<BookSummary>>(
            "/books",
            {
                params: {
                    ...params,
                    sort: "newest"
                },
                paramsSerializer: {
                    indexes: null,
                }
            }
        );
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: any } };
        throw apiError.response?.data || { message: "Failed to fetch new books" };
    }
};