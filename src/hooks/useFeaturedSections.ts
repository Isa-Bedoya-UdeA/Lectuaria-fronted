import { useState, useCallback } from "react";
import { getFeaturedSections } from "@/services/bookService";
import type { FeaturedSections } from "@/types";

export const useFeaturedSections = () => {
    const [sections, setSections] = useState<FeaturedSections | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeaturedSections = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getFeaturedSections();
            setSections(data);
        } catch (err: any) {
            console.error("Error fetching featured sections:", err);
            setError(err.message || "Failed to fetch featured sections");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        sections,
        isLoading,
        error,
        fetchFeaturedSections,
        clearError
    };
};
