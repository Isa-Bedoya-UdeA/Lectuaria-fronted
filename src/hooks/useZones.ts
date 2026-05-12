import { useState, useCallback, useEffect } from "react";
import { getZones } from "../services/zoneService";
import type { Zone, ApiError } from "../types";

interface UseZonesReturn {
	zones: Zone[];
	isLoading: boolean;
	error: string | null;
	fetchZones: () => Promise<void>;
	clearError: () => void;
}

export function useZones(): UseZonesReturn {
	const [zones, setZones] = useState<Zone[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchZones = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await getZones();
			setZones(data);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "Failed to fetch zones");
			setZones([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Auto-fetch on mount
	useEffect(() => {
		fetchZones();
	}, [fetchZones]);

	const clearError = useCallback(() => setError(null), []);

	return {
		zones,
		isLoading,
		error,
		fetchZones,
		clearError,
	};
}
