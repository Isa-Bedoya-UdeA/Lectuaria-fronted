import api from "../config/api";
import type { Author, ApiError } from "../types";

export const getAuthors = async (): Promise<Author[]> => {
	try {
		const response = await api.get<Author[]>("/authors");
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch authors" };
	}
};
