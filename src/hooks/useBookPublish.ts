// src/hooks/useBookPublish.ts
import { useState, useCallback } from "react";
import {
	prefillBookFromIsbn,
	publishBook,
	publishBookWithCover,
} from "../services/bookPublishService";
import type {
	BookPublishRequest,
	BookPublishResponse,
	BookPrefillData,
	ApiError,
} from "../types";

interface UseBookPublishReturn {
	// Prefill state
	prefillData: BookPrefillData | null;
	isPrefillLoading: boolean;
	prefillError: string | null;

	// Publish state
	publishResponse: BookPublishResponse | null;
	isPublishing: boolean;
	publishError: string | null;

	// Actions
	fetchPrefill: (isbn: number) => Promise<void>;
	publish: (data: BookPublishRequest) => Promise<BookPublishResponse>;
	publishWithCover: (data: BookPublishRequest, coverFile: File | null) => Promise<BookPublishResponse>;
	clearPrefill: () => void;
	clearPublish: () => void;
	clearErrors: () => void;
}

export function useBookPublish(): UseBookPublishReturn {
	const [prefillData, setPrefillData] = useState<BookPrefillData | null>(
		null,
	);
	const [isPrefillLoading, setIsPrefillLoading] = useState(false);
	const [prefillError, setPrefillError] = useState<string | null>(null);

	const [publishResponse, setPublishResponse] =
		useState<BookPublishResponse | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishError, setPublishError] = useState<string | null>(null);

	const fetchPrefill = useCallback(async (isbn: number): Promise<void> => {
		try {
			setIsPrefillLoading(true);
			setPrefillError(null);

			const data = await prefillBookFromIsbn(isbn);
			setPrefillData(data);
} catch (err) {
			setTimeout(() => {
				setPrefillError(
					apiError.message || "Error al buscar información del libro",
				);
			}, 3000);
			setPrefillData(null);
		} finally {
			setIsPrefillLoading(false);
		}
	}, []);

	const publish = useCallback(
		async (data: BookPublishRequest): Promise<BookPublishResponse> => {
			try {
				setIsPublishing(true);
				setPublishError(null);

				const response = await publishBook(data);
				setPublishError(
					apiError.message || "Error al publicar el libro",
				);
				throw err;
			} finally {
				setIsPublishing(false);
			}
		},
		[],
	);

	const clearPrefill = useCallback(() => {
		setPrefillData(null);
		setPrefillError(null);
		setIsPrefillLoading(false);
	}, []);

	const clearPublish = useCallback(() => {
		setPublishResponse(null);
		setPublishError(null);
		setIsPublishing(false);
	}, []);

	const publishWithCover = useCallback(
		async (data: BookPublishRequest, coverFile: File | null): Promise<BookPublishResponse> => {
			try {
				setIsPublishing(true);
				setPublishError(null);

				const response = await publishBookWithCover(data, coverFile);
				setPublishResponse(response);

				return response;
			} catch (err) {
				const apiError = err as ApiError;
				setPublishError(
					apiError.message || "Error al publicar el libro",
				);
				throw err;
			} finally {
				setIsPublishing(false);
			}
		},
		[],
	);

	const clearErrors = useCallback(() => {
		setPrefillError(null);
		setPublishError(null);
	}, []);

	return {
		prefillData,
		isPrefillLoading,
		prefillError,
		publishResponse,
		isPublishing,
		publishError,
		fetchPrefill,
		publish,
		publishWithCover,
		clearPrefill,
		clearPublish,
		clearErrors,
	};
}
