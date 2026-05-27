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

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
	try {
		const response = await api.post<LoginResponse>("/auth/login", data);

		if (response.data.accessToken) {
			setAuthToken(response.data.accessToken);
		}

		return response.data;
	} catch (error: unknown) {
		const apiError = error as { response?: { data?: ApiError } };
		const message =
			apiError.response?.data?.message || "Error al iniciar sesión";
		const errors = apiError.response?.data?.errors;

		throw {
			message,
			errors: errors || [message],
		} as ApiError;
	}
};

export const register = async (
	data: RegisterRequest,
): Promise<RegisterResponse> => {
	try {
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

export const logout = async (): Promise<void> => {
	try {
		await api.post("/auth/logout");
	} finally {
		clearAuthData();
	}
};

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