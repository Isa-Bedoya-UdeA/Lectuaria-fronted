import api from "../config/api";
import type { UserProfileDTO, UserStatsDTO, ReadingStatisticsDTO } from "@/types";

export const getUserProfile = async (usernameSlug: string): Promise<UserProfileDTO> => {
    const response = await api.get(`/users/${usernameSlug}`);
    return response.data;
};

export const getUserStats = async (usernameSlug: string): Promise<UserStatsDTO> => {
    const response = await api.get(`/users/${usernameSlug}/stats`);
    return response.data;
};

export const getReadingStatistics = async (usernameSlug: string): Promise<ReadingStatisticsDTO> => {
    const response = await api.get(`/users/${usernameSlug}/reading-statistics`);
    return response.data;
};
