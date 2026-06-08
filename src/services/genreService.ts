import api from "../config/api";
import { unwrapCollection, unwrapEntity } from "./apiHateoas";
import type { Genre, ApiError, GenreWithBookCount } from "../types";

export const getGenres = async (): Promise<Genre[]> => {
	try {
		const response = await api.get<Genre[]>("/genres");
		return unwrapCollection<Genre>(response);
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch genres" };
	}
};

export const getGenresWithBookCount = async (): Promise<GenreWithBookCount[]> => {
	try {
		const response = await api.get<GenreWithBookCount[]>("/genres/with-count");
		return unwrapCollection<GenreWithBookCount>(response);
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch genres with book count" };
	}
};

export const getGenreById = async (id: number): Promise<Genre> => {
	try {
		const response = await api.get<Genre>(`/genres/${id}`);
		return unwrapEntity<Genre>(response);
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Genre not found" };
	}
};
