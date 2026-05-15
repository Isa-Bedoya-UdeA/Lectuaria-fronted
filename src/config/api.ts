import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

// Environment variables with fallbacks
const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance with default config
const api: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Important for cookie-based auth (refreshToken)
	timeout: 30000, // 30 seconds timeout (increased for file uploads)
});

// Request interceptor: Add auth token to requests
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = localStorage.getItem("accessToken");

		// Si el data es FormData, eliminar el Content-Type para que Axios lo configure automáticamente
		if (config.data instanceof FormData) {
			delete config.headers["Content-Type"];
		}

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error: unknown): Promise<unknown> => Promise.reject(error),
);

// Response interceptor: Handle common errors
api.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => response,
	async (error: unknown): Promise<unknown> => {
		const originalConfig = (error as any).config;
		
		// Handle 401 Unauthorized - token expired or invalid
		if (axios.isAxiosError(error) && error.response?.status === 401 && !originalConfig?._retry) {
			originalConfig._retry = true;
			
			try {
				// Intentar refrescar el token
				const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
				const { accessToken } = response.data;
				
				if (accessToken) {
					localStorage.setItem("accessToken", accessToken);
					
					// Reintentar la petición original con el nuevo token
					if (originalConfig && originalConfig.headers) {
						originalConfig.headers.Authorization = `Bearer ${accessToken}`;
						return api(originalConfig);
					}
				}
			} catch (refreshError) {
				// Si falla el refresh, limpiar y salir
				localStorage.removeItem("accessToken");
				localStorage.removeItem("userRole");
				return Promise.reject(refreshError);
			}
		}

		// Handle 403 Forbidden
		if (axios.isAxiosError(error) && error.response?.status === 403) {
			console.error("Access denied:", error.response.data);
		}

		// Handle 404 Not Found
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			console.error("Resource not found:", error.response.data);
		}

		// Handle 500 Server Error
		if (axios.isAxiosError(error) && error.response?.status === 500) {
			console.error("Server error:", error.response.data);
		}

		return Promise.reject(error);
	},
);

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
	return `${API_BASE_URL}${endpoint}`;
};

// Helper function to set auth token manually (after login)
export const setAuthToken = (token: string): void => {
	localStorage.setItem("accessToken", token);
};

// Helper function to clear auth data (after logout)
export const clearAuthData = (): void => {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("userRole");
	localStorage.removeItem("isAuthenticated");
};

export default api;
