import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
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

interface AuthContextType {
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
    clearAllErrors: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Iniciar como true hasta verificar auth
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Limpiar errores al desmontar (cuando el usuario navega a otra página)
    useEffect(() => {
        return () => {
            setError(null);
            setValidationErrors([]);
        };
    }, []);

    // Verificar autenticación al montar
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Siempre intentamos obtener el perfil. 
                // Si no hay token o expiró, el interceptor de api.ts intentará el refresh silencioso.
                const profile = await getProfile();
                setUser(profile);
                if (profile.userRole) {
                    localStorage.setItem("userRole", profile.userRole);
                    localStorage.setItem("isAuthenticated", "true");
                }
            } catch (err) {
                // Solo limpiamos si realmente no se pudo recuperar la sesión
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("isAuthenticated");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const refreshProfile = useCallback(async (): Promise<void> => {
        try {
            const profile = await getProfile();
            setUser(profile);
            setError(null);
            setValidationErrors([]);
            if (profile.userRole) {
                localStorage.setItem("userRole", profile.userRole);
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || "No se pudo cargar el perfil");
            setValidationErrors(apiError.errors || []);
            setUser(null);
            localStorage.removeItem("userRole");
        }
    }, []);

    const login = useCallback(async (data: LoginRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            setValidationErrors([]);

            await loginService(data);
            await refreshProfile();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || "Error al iniciar sesión");
            setValidationErrors(apiError.errors || []);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [refreshProfile]);

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
        []
    );

    const clearError = useCallback(() => setError(null), []);
    const clearValidationErrors = useCallback(() => setValidationErrors([]), []);

    // Función para limpiar todos los errores
    const clearAllErrors = useCallback(() => {
        setError(null);
        setValidationErrors([]);
    }, []);

    return (
        <AuthContext.Provider
            value={{
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
                clearAllErrors,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};