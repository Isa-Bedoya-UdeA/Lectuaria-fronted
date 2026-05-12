import type { AxiosResponse } from "axios";
import api from "../config/api";
import type { ApiError } from "../types";

// Generic response handler with type safety
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
	return response.data;
};

// Generic error handler
export const handleApiError = (error: unknown): ApiError => {
	if (error && typeof error === "object" && "response" in error) {
		const axiosError = error as { response?: { data?: ApiError } };
		return (
			axiosError.response?.data || {
				message: "An unexpected error occurred",
			}
		);
	}
	return { message: "An unexpected error occurred" };
};

// Type-safe GET wrapper
export const apiGet = async <T>(
	url: string,
	config?: { params?: Record<string, unknown> },
): Promise<T> => {
	const response = await api.get<T>(url, config);
	return handleApiResponse(response);
};

// Type-safe POST wrapper
export const apiPost = async <T, R = unknown>(
	url: string,
	data?: R,
	config?: { params?: Record<string, unknown> },
): Promise<T> => {
	const response = await api.post<T>(url, data, config);
	return handleApiResponse(response);
};

// Type-safe PUT wrapper
export const apiPut = async <T, R = unknown>(
	url: string,
	data?: R,
	config?: { params?: Record<string, unknown> },
): Promise<T> => {
	const response = await api.put<T>(url, data, config);
	return handleApiResponse(response);
};
