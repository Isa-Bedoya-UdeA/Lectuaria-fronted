// src/utils/authHelpers.ts
import type { UserRole } from "../types/auth";

/**
 * Formatear rol para mostrar en UI
 */
export const formatUserRole = (role: UserRole): string => {
	const roles: Record<UserRole, string> = {
		NORMAL: "Usuario",
		LIBRARIAN: "Biblioteca",
		ADMIN: "Administrador",
	};
	return roles[role] || role;
};

/**
 * Verificar si un rol tiene permisos para acceder a una ruta
 */
export const hasAccess = (
	userRole: UserRole | null,
	allowedRoles: UserRole[],
): boolean => {
	if (!userRole) return false;
	return allowedRoles.includes(userRole);
};

/**
 * Validar contraseña según políticas del backend
 */
export const validatePassword = (
	password: string,
): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (password.length < 8) errors.push("Mínimo 8 caracteres");
	if (!/[A-Z]/.test(password)) errors.push("Al menos una mayúscula");
	if (!/\d/.test(password)) errors.push("Al menos un número");

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Formatear email para envío al backend (lowercase + trim)
 */
export const formatEmail = (email: string): string => {
	return email.trim().toLowerCase();
};
