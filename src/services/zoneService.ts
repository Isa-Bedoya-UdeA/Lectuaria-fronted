import api from "../config/api";
import type { Zone, ZonesResponse, ApiError } from "../types";

/**
 * Get all available zones (Medellín communes)
 */
export const getZones = async (): Promise<ZonesResponse> => {
	try {
		const response = await api.get<ZonesResponse>("/zones");
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Failed to fetch zones" };
	}
};

/**
 * Get zone by ID
 */
export const getZoneById = async (id: number): Promise<Zone> => {
	try {
		const response = await api.get<Zone>(`/zones/${id}`);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Zone not found" };
	}
};
