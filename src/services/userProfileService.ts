import api from "../config/api";
import { unwrapEntity } from "./apiHateoas";
import type { UserProfileDTO, UserStatsDTO, ReadingStatisticsDTO, SocialStatisticsDTO } from "@/types";

export const getUserProfile = async (usernameSlug: string): Promise<UserProfileDTO> => {
    const response = await api.get(`/users/${usernameSlug}`);
    return unwrapEntity<UserProfileDTO>(response);
};

export const getUserStats = async (usernameSlug: string): Promise<UserStatsDTO> => {
    const response = await api.get(`/users/${usernameSlug}/stats`);
    return unwrapEntity<UserStatsDTO>(response);
};

export const getReadingStatistics = async (usernameSlug: string): Promise<ReadingStatisticsDTO> => {
    const response = await api.get(`/users/${usernameSlug}/reading-statistics`);
    return unwrapEntity<ReadingStatisticsDTO>(response);
};

export const getSocialStatistics = async (usernameSlug: string): Promise<SocialStatisticsDTO> => {
    const response = await api.get(`/users/${usernameSlug}/social-statistics`);
    return unwrapEntity<SocialStatisticsDTO>(response);
};
