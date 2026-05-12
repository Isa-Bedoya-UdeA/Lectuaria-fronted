// src/types/auth.ts

// Roles que coinciden EXACTAMENTE con el backend (UserRole.java)
export type UserRole = "NORMAL" | "LIBRARIAN" | "ADMIN";

// Request para registro de usuario NORMAL
export interface RegisterUserRequest {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	userRole: "NORMAL";
	username: string; // Requerido para usuarios normales
}

// Datos de biblioteca para registro de LIBRARIAN
export interface LibraryRegistrationData {
	name: string;
	description?: string;
	address: string;
	contactEmail: string;
	contactPhone?: string;
	openingHours: string;
	idZone: number; // ID de la zona/comuna de Medellín
}

// Request para registro de bibliotecario LIBRARIAN
export interface RegisterLibrarianRequest {
	fullName: string; // Nombre del bibliotecario (persona)
	email: string; // Email de la cuenta de usuario
	password: string;
	confirmPassword: string;
	userRole: "LIBRARIAN";
	library: LibraryRegistrationData; // Datos de la biblioteca
}

// Union type para el request de registro (backend espera uno u otro)
export type RegisterRequest = RegisterUserRequest | RegisterLibrarianRequest;

// Response del registro
export interface RegisterResponse {
	message: string;
	userRole: UserRole;
}

// Request para login
export interface LoginRequest {
	email: string;
	password: string;
	rememberMe?: boolean;
}

// Response del login
export interface LoginResponse {
	message: string;
	accessToken: string;
	// refreshToken se envía vía cookie HttpOnly, no en el body
}

// Response del perfil de usuario (GET /api/auth/me)
export interface ProfileResponse {
	// Campos comunes para todos los roles
	id: number;
	email: string;
	fullName: string;
	userRole: UserRole;
	username: string;
	photoUrl?: string;
	biography?: string;

	// Campos específicos para LIBRARIAN (null para NORMAL)
	libraryId?: number;
	libraryName?: string;
	libraryAddress?: string;
	libraryContactEmail?: string;
	libraryContactPhone?: string;
	libraryOpeningHours?: string;
	libraryZoneId?: number;
	libraryZoneName?: string;
}

// Request para actualizar perfil
export interface ProfileUpdateRequest {
	// Campos comunes (opcionales)
	username?: string;
	photoUrl?: string;
	biography?: string;

	// Campos específicos para bibliotecarios (opcionales)
	libraryName?: string;
	libraryLocation?: string; // address
	contactInfo?: string; // contactEmail
	contactPhone?: string;
	officeHours?: string; // openingHours
	idZone?: number;
}

// Error response estándar de la API
export interface ApiError {
	message: string;
	errors?: string[]; // Array de mensajes de validación
}

// Form inputs para React Hook Form en SignIn
export interface SignInFormInputs {
	email: string;
	password: string;
	rememberMe?: boolean;
}

// Form inputs para React Hook Form en SignUp (usuario normal)
export interface SignUpUserFormInputs {
	fullName: string;
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
}

// Form inputs para React Hook Form en SignUp (bibliotecario)
export interface SignUpLibrarianFormInputs {
	fullName: string; // Nombre de la persona bibliotecaria
	email: string; // Email de la cuenta
	password: string;
	confirmPassword: string;
	// Datos de la biblioteca
	libraryName: string;
	libraryDescription?: string;
	libraryAddress: string;
	libraryContactEmail: string;
	libraryContactPhone?: string;
	libraryOpeningHours: string;
	libraryZoneId: number;
}
