import api from "../config/api";
import { unwrapCollection, unwrapEntity } from "./apiHateoas";
import type { Zone, ZonesResponse, ApiError } from "../types";

/**
 * Get all available zones (Medellín communes)
 */
export const getZones = async (): Promise<ZonesResponse> => {
	try {
		const response = await api.get<ZonesResponse>("/zones");
		const list = unwrapCollection<Zone>(response);
		return { zones: list };
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
		return unwrapEntity<Zone>(response);
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		throw apiError.response?.data || { message: "Zone not found" };
	}
};
