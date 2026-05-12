import { useState, useCallback } from "react";
import * as userProfileService from "../services/userProfileService";
import type { UserProfileDTO, UserStatsDTO, UserReviewDTO } from "../types";

export const useUserProfile = (usernameSlug: string) => {
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [stats, setStats] = useState<UserStatsDTO | null>(null);
    const [reviews, setReviews] = useState<UserReviewDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsPage, setReviewsPage] = useState(0);

    const fetchProfile = useCallback(async () => {
        if (!usernameSlug) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await userProfileService.getUserProfile(usernameSlug);
            setProfile(data);
            setStats(data.stats);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar el perfil");
        } finally {
            setIsLoading(false);
        }
    }, [usernameSlug]);

    const fetchReviews = useCallback(async (page: number = 0) => {
        if (!usernameSlug) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await userProfileService.getUserReviews(usernameSlug, page, 10);
            setReviews(data.content);
            setReviewsTotal(data.totalElements);
            setReviewsPage(page);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar las reseñas");
        } finally {
            setIsLoading(false);
        }
    }, [usernameSlug]);

    return {
        profile,
        stats,
        reviews,
        isLoading,
        error,
        reviewsTotal,
        reviewsPage,
        fetchProfile,
        fetchReviews,
        clearError: () => setError(null)
    };
};
