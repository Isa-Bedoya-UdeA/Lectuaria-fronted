// src/services/authService.ts
import api, { setAuthToken, clearAuthData } from "../config/api";
import type {
	RegisterRequest,
	RegisterResponse,
	LoginRequest,
	LoginResponse,
	ProfileResponse,
	ProfileUpdateRequest,
	ApiError,
} from "../types";

/**
 * Login user - stores accessToken in localStorage, refreshToken via HttpOnly cookie
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
	try {
		const response = await api.post<LoginResponse>("/auth/login", data);

		// Guardar accessToken para requests futuros (Authorization header)
		if (response.data.accessToken) {
			setAuthToken(response.data.accessToken);
			// El refreshToken se maneja automáticamente vía cookie HttpOnly
		}

		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al iniciar sesión";
		const errors = apiError.response?.data?.errors;

		// Lanzar error con mensajes de validación si existen
		throw {
			message,
			errors: errors || [message],
		} as ApiError;
	}
};

/**
 * Register new user or librarian
 * - For READER users: send username
 * - For LIBRARIAN users: send library object with zone info
 */
export const register = async (
	data: RegisterRequest,
): Promise<RegisterResponse> => {
	try {
		// Validación básica del lado del cliente
		if (data.password !== data.confirmPassword) {
			throw {
				message: "Las contraseñas no coinciden",
				errors: ["Las contraseñas no coinciden"],
			} as ApiError;
		}

		const response = await api.post<RegisterResponse>(
			"/auth/register",
			data,
		);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al registrar";
		const errors = apiError.response?.data?.errors;

		throw {
			message,
			errors: errors || [message],
		} as ApiError;
	}
};

/**
 * Logout user - calls backend to invalidate refreshToken cookie
 */
export const logout = async (): Promise<void> => {
	try {
		await api.post("/auth/logout");
	} finally {
		// Siempre limpiar datos locales, incluso si la llamada falla
		clearAuthData();
	}
};

/**
 * Get current authenticated user profile
 */
export const getProfile = async (): Promise<ProfileResponse> => {
	try {
		const response = await api.get<ProfileResponse>("/auth/me");
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al cargar perfil";

		throw { message, errors: [message] } as ApiError;
	}
};

/**
 * Update user profile (common fields + librarian-specific fields)
 */
export const updateProfile = async (
	data: ProfileUpdateRequest,
): Promise<ProfileResponse> => {
	try {
		const response = await api.put<ProfileResponse>("/auth/me", data);
		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al actualizar perfil";
		const errors = apiError.response?.data?.errors;

		throw {
			message,
			errors: errors || [message],
		} as ApiError;
	}
};
