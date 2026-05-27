// src/hooks/useAuth.ts
import { useState, useCallback, useEffect } from "react";
import {
	login as loginService,
	logout as logoutService,
	getProfile,
	updateProfile,
} from "../services/authService";
import type {
	LoginRequest,
	ProfileResponse,
	ProfileUpdateRequest,
	ApiError,
} from "../types";

interface UseAuthReturn {
	user: ProfileResponse | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	validationErrors: string[];
	login: (data: LoginRequest) => Promise<void>;
	logout: () => Promise<void>;
	refreshProfile: () => Promise<void>;
	updateProfile: (data: ProfileUpdateRequest) => Promise<ProfileResponse>;
	clearError: () => void;
	clearValidationErrors: () => void;
}

export function useAuth(): UseAuthReturn {
	const [user, setUser] = useState<ProfileResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			refreshProfile().catch(() => {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("userRole");
			});
		} else {
			setIsLoading(false);
		}
	}, []);

	const refreshProfile = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			const profile = await getProfile();
			setUser(profile);
			setError(null);
			setValidationErrors([]);
			localStorage.setItem("userRole", profile.userRole);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "No se pudo cargar el perfil");
			setValidationErrors(apiError.errors || []);
			setUser(null);
			localStorage.removeItem("userRole");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const login = useCallback(
		async (data: LoginRequest): Promise<void> => {
			try {
				setIsLoading(true);
				setError(null);
				setValidationErrors([]);

				await loginService(data);
				// Cargar perfil después del login exitoso
				await refreshProfile();
			} catch (err) {
				const apiError = err as ApiError;
				setError(apiError.message || "Error al iniciar sesión");
				setValidationErrors(apiError.errors || []);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[refreshProfile],
	);

	const logout = useCallback(async (): Promise<void> => {
		try {
			await logoutService();
		} finally {
			setUser(null);
			localStorage.removeItem("userRole");
			setError(null);
			setValidationErrors([]);
		}
	}, []);

	const updateProfileHandler = useCallback(
		async (data: ProfileUpdateRequest): Promise<ProfileResponse> => {
			try {
				setIsLoading(true);
				setError(null);
				setValidationErrors([]);

				const updated = await updateProfile(data);
				setUser(updated);

				return updated;
			} catch (err) {
				const apiError = err as ApiError;
				setError(apiError.message || "Error al actualizar perfil");
				setValidationErrors(apiError.errors || []);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const clearValidationErrors = useCallback(() => {
		setValidationErrors([]);
	}, []);

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		error,
		validationErrors,
		login,
		logout,
		refreshProfile,
		updateProfile: updateProfileHandler,
		clearError,
		clearValidationErrors,
	};
}
