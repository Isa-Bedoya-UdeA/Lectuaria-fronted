import api from "../config/api";
import type { BookSummary } from "@/types";

export interface RecommendationDTO {
    book: BookSummary;
    reason: string;
    generatedAt: string;
    nextRefreshAt: string;
}

/**
 * Obtiene las recomendaciones de libros personalizadas para el lector autenticado.
 */
export const getRecommendations = async (size = 10): Promise<RecommendationDTO[]> => {
    const response = await api.get(`/home/recommendations`, { params: { size } });
    return response.data;
};

/**
 * Oculta una recomendación de libro específica.
 */
export const hideRecommendation = async (bookId: number): Promise<void> => {
    await api.delete(`/home/recommendations/${bookId}`);
};
