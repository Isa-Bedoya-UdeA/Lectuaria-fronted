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

		if (apiError.response?.status === 404) {
			return null;
		}

		const message =
			apiError.response?.data?.message ||
			"Error al buscar información del libro";
		throw { message, errors: [message] } as ApiError;
	}
};

export const publishBook = async (
	data: BookPublishRequest,
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