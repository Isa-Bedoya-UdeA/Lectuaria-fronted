// src/pages/auth/SignUp.tsx
import { Link, useNavigate } from "react-router-dom";
import "./auth.scss";
import { PATHS } from "@/constants/routes";
import Button from "@/components/UI/Button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useZones } from "@/hooks/useZones";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { SITE_INFO } from "@/constants/siteInfo";
import type { UserRole } from "@/types/auth";
import { register as registerService } from "@/services/authService";
import useSEO from "@/hooks/useSEO";
import CustomSelect from "@/components/UI/CustomSelect";
import Toast, { type ToastType } from "@/components/UI/Toast";

// Tipos de formulario unificados
interface SignUpFormInputs {
    // Campos comunes
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;

    // Para usuario READER
    username?: string;

    // Para bibliotecario LIBRARIAN
    libraryName?: string;
    libraryDescription?: string;
    libraryAddress?: string;
    libraryContactEmail?: string;
    libraryContactPhone?: string;
    libraryOpeningHours?: string;
    libraryZoneId?: number;
}

const SignUp = () => {
    const {
        isLoading: isAuthLoading,
        error: authError,
        validationErrors,
        clearAllErrors
    } = useAuth();

    const { zones, isLoading: zonesLoading, error: zonesError } = useZones();

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitted },
        setValue
    } = useForm<SignUpFormInputs>({
        defaultValues: {
            libraryContactEmail: "",
            libraryContactPhone: "",
            libraryDescription: "",
        },
        mode: "onSubmit",
        reValidateMode: "onChange"
    });

    const password = watch("password") || "";
    const [userRole, setUserRole] = useState<UserRole>("READER");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useSEO({
        title: `Crear cuenta | ${SITE_INFO.name}`,
        description: `Únete a ${SITE_INFO.name}, la comunidad literaria de Medellín. Crea tu cuenta y comienza a descubrir libros y bibliotecas.`,
        keywords: "libros, registro, biblioteca, Medellín, comunidad lectores"
    });

    // Scroll to top cuando cambia el rol
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [userRole]);

    // Limpiar errores del servidor cuando el usuario empieza a escribir después de un error
    useEffect(() => {
        // Solo limpiar errores si hay errores presentes y el usuario ha modificado el formulario
        if ((serverError || authError || validationErrors.length > 0) && isSubmitted) {
            const timer = setTimeout(() => {
                clearAllErrors();
                setServerError(null);
            }, 1000); // Esperar 1 segundo después del último cambio
            return () => clearTimeout(timer);
        }
    }, [watch("email"), watch("password"), watch("confirmPassword"), watch("fullName"), authError, validationErrors, serverError, isSubmitted]);

    const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
        try {
            setServerError(null);
            clearAllErrors();

            if (userRole === "READER") {
                // Registro de usuario lector
                await registerService({
                    fullName: data.fullName.trim(),
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                    userRole: "READER",
                    username: data.username?.trim() || "",
                });
            } else {
                // Registro de bibliotecario con datos de biblioteca
                if (!data.libraryZoneId) {
                    setServerError("Debes seleccionar una comuna/zona");
                    return;
                }

                await registerService({
                    fullName: data.fullName.trim(),
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                    userRole: "LIBRARIAN",
                    library: {
                        name: data.libraryName?.trim() || "",
                        description: data.libraryDescription?.trim(),
                        address: data.libraryAddress?.trim() || "",
                        contactEmail: data.libraryContactEmail?.trim().toLowerCase() || data.email.trim().toLowerCase(),
                        contactPhone: data.libraryContactPhone?.trim(),
                        openingHours: data.libraryOpeningHours?.trim() || "",
                        idZone: data.libraryZoneId,
                    },
                });
            }

            setToast({ message: "¡Cuenta creada! Redirigiendo al inicio de sesión...", type: "success" });
            setTimeout(() => {
                navigate(PATHS.SIGNIN);
            }, 3000);
        } catch (err: any) {
            // Los errores de validación ya están en validationErrors del hook
            setServerError(err.message || "Error al registrar");
        }
    };

    // Requisitos de contraseña
    const requirements = [
        { id: 'length', label: 'Mínimo 8 caracteres', met: password.length >= 8 },
        { id: 'uppercase', label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
        { id: 'number', label: 'Al menos un número', met: /\d/.test(password) },
    ];

    const handleRoleChange = (role: UserRole) => {
        setUserRole(role);
        // Resetear errores al cambiar de rol
        clearAllErrors();
        setServerError(null);
    };

    useEffect(() => {
        clearAllErrors();
        setServerError(null);
    }, []);

    const isLoading = isAuthLoading || (userRole === "LIBRARIAN" && zonesLoading);

    return (
        <main className="auth signUp">
            <section className="auth__header">
                <h1>Crear Cuenta</h1>
                <p>Únete a la mejor comunidad de lectores en {SITE_INFO.name}</p>
            </section>

            {/* Errores del servidor */}
            {(serverError || authError) && (
                <Toast
                    message={serverError || authError || ""}
                    type="error"
                    onClose={() => {
                        clearAllErrors();
                        setServerError(null);
                    }}
                />
            )}

            {/* Errores de validación del backend */}
            {validationErrors.length > 0 && (
                <Toast
                    message={validationErrors.join(", ")}
                    type="error"
                    onClose={() => clearAllErrors()}
                />
            )}

            {/* Error al cargar zonas */}
            {userRole === "LIBRARIAN" && zonesError && (
                <Toast
                    message="No se pudieron cargar las zonas. Intenta de nuevo."
                    type="error"
                    onClose={() => {}}
                />
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Selector de rol */}
                <section className="auth__userRole">
                    <button
                        type="button"
                        className={userRole === "READER" ? "selected" : ""}
                        onClick={() => handleRoleChange("READER")}
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </g>
                        </svg>
                        <span>Usuario</span>
                    </button>
                    <button
                        type="button"
                        className={userRole === "LIBRARIAN" ? "selected" : ""}
                        onClick={() => handleRoleChange("LIBRARIAN")}
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <path d="M10 12h4m-4-4h4m0 13v-3a2 2 0 0 0-4 0v3" />
                                <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
                                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                            </g>
                        </svg>
                        <span>Biblioteca</span>
                    </button>
                </section>

                <div className="auth__form">
                    {/* Campos para usuario READER */}
                    {userRole === "READER" && (
                        <section className="auth__group">
                            <label htmlFor="username">Nombre de usuario *</label>
                            <input
                                type="text"
                                placeholder="ej: juan_lector"
                                id="username"
                                disabled={isLoading}
                                {...register("username", {
                                    required: "El nombre de usuario es requerido",
                                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                    pattern: {
                                        value: /^[a-zA-Z0-9_]+$/,
                                        message: "Solo letras, números y guiones bajos"
                                    }
                                })}
                            />
                            {errors.username && <p className="auth__error">{errors.username.message}</p>}
                        </section>
                    )}

                    <section className="auth__group">
                        <label htmlFor="email">Correo electrónico *</label>
                        <input
                            type="email"
                            placeholder="tu@correo.com"
                            id="email"
                            disabled={isLoading}
                            {...register("email", {
                                required: "El correo es requerido",
                                pattern: { value: /^\S+@\S+\.\S+$/i, message: "Email inválido" }
                            })}
                        />
                        {errors.email && <p className="auth__error">{errors.email.message}</p>}
                    </section>

                    {/* Campos para bibliotecario LIBRARIAN */}
                    {userRole === "LIBRARIAN" && (
                        <>
                            <section className="auth__group">
                                <label htmlFor="libraryName">Nombre de la Biblioteca *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Biblioteca Pública Piloto"
                                    id="libraryName"
                                    disabled={isLoading}
                                    {...register("libraryName", { required: "El nombre es requerido" })}
                                />
                                {errors.libraryName && <p className="auth__error">{errors.libraryName.message}</p>}
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryDescription">Descripción (opcional)</label>
                                <textarea
                                    placeholder="Breve descripción de tu biblioteca..."
                                    id="libraryDescription"
                                    rows={3}
                                    disabled={isLoading}
                                    {...register("libraryDescription")}
                                />
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryAddress">Dirección *</label>
                                <input
                                    type="text"
                                    placeholder="Carrera 43A #12-45, El Poblado"
                                    id="libraryAddress"
                                    disabled={isLoading}
                                    {...register("libraryAddress", { required: "La dirección es requerida" })}
                                />
                                {errors.libraryAddress && <p className="auth__error">{errors.libraryAddress.message}</p>}
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryContactEmail">Email de contacto (opcional)</label>
                                <input
                                    type="email"
                                    placeholder="contacto@biblioteca.gov.co"
                                    id="libraryContactEmail"
                                    disabled={isLoading}
                                    {...register("libraryContactEmail", {
                                        pattern: { value: /^\S+@\S+\.\S+$/i, message: "Email inválido" }
                                    })}
                                />
                                {errors.libraryContactEmail && <p className="auth__error">{errors.libraryContactEmail.message}</p>}
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryContactPhone">Teléfono de contacto (opcional)</label>
                                <input
                                    type="tel"
                                    placeholder="+57 4 266 6060"
                                    id="libraryContactPhone"
                                    disabled={isLoading}
                                    {...register("libraryContactPhone")}
                                />
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryOpeningHours">Horario de atención *</label>
                                <input
                                    type="text"
                                    placeholder="Lun-Vie: 8am-8pm, Sáb: 9am-5pm"
                                    id="libraryOpeningHours"
                                    disabled={isLoading}
                                    {...register("libraryOpeningHours", { required: "El horario es requerido" })}
                                />
                                {errors.libraryOpeningHours && <p className="auth__error">{errors.libraryOpeningHours.message}</p>}
                            </section>

                            <section className="auth__group">
                                <label htmlFor="libraryZoneId">Comuna/Zona *</label>
                                <CustomSelect
                                    id="libraryZoneId"
                                    value={watch("libraryZoneId") || ""}
                                    onChange={(value) => setValue("libraryZoneId", value as number)}
                                    options={zones.map(zone => ({ value: zone.id, label: zone.name }))}
                                    placeholder="Selecciona tu comuna"
                                    disabled={isLoading || zonesLoading}
                                />
                                {errors.libraryZoneId && <p className="auth__error">{errors.libraryZoneId.message}</p>}
                            </section>
                        </>
                    )}

                    {/* Campos comunes para todos */}
                    <section className="auth__group">
                        <label htmlFor="fullName">Nombre Completo *</label>
                        <input
                            type="text"
                            placeholder={userRole === "LIBRARIAN" ? "Tu nombre completo" : "Tu nombre completo"}
                            id="fullName"
                            disabled={isLoading}
                            {...register("fullName", {
                                required: "El nombre completo es requerido",
                                minLength: { value: 2, message: "Mínimo 2 caracteres" }
                            })}
                        />
                        {errors.fullName && <p className="auth__error">{errors.fullName.message}</p>}
                    </section>

                    <section className="auth__group">
                        <label htmlFor="password">Contraseña *</label>
                        <div className="auth__passwordWrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                disabled={isLoading}
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    validate: {
                                        length: (v) => v.length >= 8 || "Mínimo 8 caracteres",
                                        uppercase: (v) => /[A-Z]/.test(v) || "Al menos una mayúscula",
                                        number: (v) => /\d/.test(v) || "Al menos un número",
                                    }
                                })}
                                id="password"
                            />
                            <button
                                type="button"
                                className="auth__passwordToggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g></svg>
                                )}
                            </button>
                        </div>
                        <div className="password-requirements">
                            {requirements.map((req) => {
                                let statusClass = "requirement";
                                let Icon = RadioButtonUncheckedIcon;

                                if (req.met) {
                                    statusClass += " satisfied";
                                    Icon = CheckCircleIcon;
                                } else if (isSubmitted) {
                                    statusClass += " unsatisfied-submitted";
                                    Icon = CancelIcon;
                                }

                                return (
                                    <div key={req.id} className={statusClass}>
                                        <Icon />
                                        <span>{req.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="auth__group">
                        <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                        <div className="auth__passwordWrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="********"
                                disabled={isLoading}
                                {...register("confirmPassword", {
                                    required: "Confirma tu contraseña",
                                    validate: (value) => value === password || "Las contraseñas no coinciden"
                                })}
                                id="confirmPassword"
                            />
                            <button
                                type="button"
                                className="auth__passwordToggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g></svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="auth__error">{errors.confirmPassword.message}</p>}
                    </section>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Registrando...
                            </>
                        ) : (
                            `Registrarme como ${userRole === "READER" ? "Usuario" : "Biblioteca"}`
                        )}
                    </Button>

                    <p className="auth__other">
                        ¿Ya tienes cuenta?
                        <Link to={PATHS.SIGNIN}>
                            <Button variant="text" disabled={isLoading}>Inicia Sesión</Button>
                        </Link>
                    </p>
                </div>
            </form>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
};

export default SignUp;