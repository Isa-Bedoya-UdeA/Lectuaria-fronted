import api from "../config/api";
import type {
	BookPublishRequest,
	BookPublishResponse,
	BookPrefillData,
	ApiError,
} from "../types";

export const prefillBookFromIsbn = async (
	isbn: number,
): Promise<BookPrefillData | null> => {
	try {
		const response = await api.get<BookPrefillData>(
			`/books/prefill/${isbn}`,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as {
			response?: { data?: ApiError; status?: number };
		};

		// 404 means book not found in external sources - this is expected, not an error
		if (apiError.response?.status === 404) {
			return null;
		}

		const message =
			apiError.response?.data?.message ||
			"Error al buscar información del libro";
		throw { message, errors: [message] } as ApiError;
	}
};

/**
 * Publish a book or associate existing book to librarian's library
 * Handles both: new book creation AND adding existing book to library
 */
export const publishBook = async (
	data: BookPublishRequest,
): Promise<BookPublishResponse> => {
	try {
		// Client-side validation before sending to backend
		if (!data.isbn || !data.title || data.authors.length === 0) {
			throw {
				message: "Datos incompletos",
				errors: ["ISBN, título y al menos un autor son obligatorios"],
			} as ApiError;
		}

		if (
			!data.availability ||
			(!data.availability.physical && !data.availability.digital)
		) {
			throw {
				message: "Disponibilidad requerida",
				errors: [
					"Debes seleccionar al menos un tipo de disponibilidad (físico o digital)",
				],
			} as ApiError;
		}

		const response = await api.post<BookPublishResponse>(
			"/books/publish",
			data,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al publicar el libro";
		const errors = apiError.response?.data?.errors || [message];

		throw { message, errors } as ApiError;
	}
};

/**
 * Publish a book with an optional cover image file (multipart/form-data).
 * Used when librarian uploads a local image instead of providing a URL.
 */
export const publishBookWithCover = async (
	data: BookPublishRequest,
	coverFile?: File | null,
): Promise<BookPublishResponse> => {
	try {
		if (!data.isbn || !data.title || data.authors.length === 0) {
			throw {
				message: "Datos incompletos",
				errors: ["ISBN, título y al menos un autor son obligatorios"],
			} as ApiError;
		}

		if (
			!data.availability ||
			(!data.availability.physical && !data.availability.digital)
		) {
			throw {
				message: "Disponibilidad requerida",
				errors: [
					"Debes seleccionar al menos un tipo de disponibilidad (físico o digital)",
				],
			} as ApiError;
		}

		// Encode cover file as data URL so it can be sent as JSON
		if (coverFile) {
			const base64 = await fileToBase64(coverFile);
			data.coverUrl = base64;
		}

		const response = await api.post<BookPublishResponse>(
			"/books/publish-with-cover",
			data,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al publicar el libro";
		const errors = apiError.response?.data?.errors || [message];

		throw { message, errors } as ApiError;
	}
};

const fileToBase64 = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
