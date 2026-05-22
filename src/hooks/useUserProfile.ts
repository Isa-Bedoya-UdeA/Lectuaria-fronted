import { useState, useCallback } from "react";
import * as userProfileService from "../services/userProfileService";
import * as friendActivityService from "../services/friendActivityService";
import type { UserProfileDTO, UserStatsDTO, UserReviewDTO } from "../types";
import type { FriendActivityDTO } from "../services/friendActivityService";

export const useUserProfile = (usernameSlug: string) => {
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [stats, setStats] = useState<UserStatsDTO | null>(null);
    const [reviews, setReviews] = useState<UserReviewDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [reviewsPage, setReviewsPage] = useState(0);
    const [friendActivity, setFriendActivity] = useState<FriendActivityDTO[]>([]);

    const fetchProfile = useCallback(async () => {
        if (!usernameSlug) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await userProfileService.getUserProfile(usernameSlug);
            setProfile(data);
            setStats(data.stats);
            // Cargar actividad de amigos si es amigo
            if (data.friendshipStatus === "ACCEPTED") {
                try {
                    const activity = await friendActivityService.getFriendActivity(usernameSlug);
                    setFriendActivity(activity);
                } catch (activityErr) {
                    console.error("Error loading friend activity:", activityErr);
                }
            }
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.data?.message?.includes("privado")) {
                setError("Este perfil es privado");
            } else {
                setError(err.response?.data?.message || "Error al cargar el perfil");
            }
        } finally {
            setIsLoading(false);
        }
    }, [usernameSlug]);

    const fetchReviews = useCallback(async (page: number = 0) => {
        if (!usernameSlug) return;
        
        setIsLoading(true);
        setError(null);
        try {
            // Temporarily use a mock implementation since getUserReviews doesn't exist
            // This should be implemented in the backend service
            setReviews([]);
            setReviewsTotal(0);
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
        friendActivity,
        isLoading,
        error,
        reviewsTotal,
        reviewsPage,
        fetchProfile,
        fetchReviews,
        clearError: () => setError(null)
    };
};
