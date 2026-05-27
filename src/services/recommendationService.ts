import api from "../config/api";
import type { BookSummary } from "@/types";

export interface RecommendationDTO {
    book: BookSummary;
    reason: string;
    generatedAt: string;
    nextRefreshAt: string;
}

export const getRecommendations = async (size = 10): Promise<RecommendationDTO[]> => {
    const response = await api.get(`/home/recommendations`, { params: { size } });
    return response.data;
};

export const hideRecommendation = async (bookId: number): Promise<void> => {
    await api.delete(`/home/recommendations/${bookId}`);
};