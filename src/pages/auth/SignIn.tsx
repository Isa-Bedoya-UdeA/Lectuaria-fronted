// src/pages/auth/SignIn.tsx
import { Link, useNavigate } from "react-router-dom";
import "./auth.scss";
import { PATHS } from "@/constants/routes";
import Button from "@/components/UI/Button";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { SignInFormInputs } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { SITE_INFO } from "@/constants/siteInfo";
import { useState, useEffect } from "react";
import useSEO from "@/hooks/useSEO";
import Toast, { type ToastType } from "@/components/UI/Toast";

const SignIn = () => {
    const { login, isLoading, error, validationErrors, clearAllErrors } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormInputs>();
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Limpiar errores al montar el componente
    useEffect(() => {
        clearAllErrors();
    }, []);

    useSEO({
        title: `Iniciar sesión | ${SITE_INFO.name}`,
        description: `Inicia sesión en ${SITE_INFO.name} para acceder a tus libros, listas y conectar con la comunidad.`,
        keywords: "libros, inicio sesión, biblioteca, Medellín, comunidad lectora"
    });

    const onSubmit: SubmitHandler<SignInFormInputs> = async (data) => {
        try {
            clearAllErrors();
            await login({
                email: data.email.trim().toLowerCase(),
                password: data.password,
                rememberMe: data.rememberMe
            });
            setToast({ message: "¡Bienvenido de vuelta!", type: "success" });
            // Redirigir después de un breve delay para mostrar el mensaje
            setTimeout(() => {
                const userRole = localStorage.getItem("userRole");
                if (userRole === "LIBRARIAN") {
                    navigate(PATHS.MY_LIBRARY);
                } else {
                    navigate(PATHS.HOME);
                }
            }, 1500);
        } catch {
            // El error ya está manejado por el hook useAuth
        }
    };

    return (
        <main className="auth signIn">
            <section className="auth__header">
                <h1>Iniciar sesión</h1>
                <p>Bienvenido de vuelta a {SITE_INFO.name}</p>
            </section>

            {/* Mostrar errores de validación del backend */}
            {validationErrors.length > 0 && (
                <Toast
                    message={validationErrors.join(", ")}
                    type="error"
                    onClose={() => clearAllErrors()}
                />
            )}

            {/* Mostrar error general */}
            {error && !validationErrors.length && (
                <Toast
                    message={error === "Credenciales inválidas" 
                        ? "Usuario o contraseña incorrectos. Verifica tus datos e intenta de nuevo."
                        : error
                    }
                    type="error"
                    onClose={() => clearAllErrors()}
                />
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="auth__form">
                    <section className="auth__group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="tu@correo.com"
                            id="email"
                            disabled={isLoading}
                            {...register("email", {
                                required: "El correo es requerido",
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/i,
                                    message: "Ingresa un correo válido"
                                }
                            })}
                        />
                        {errors.email && <p className="auth__error">{errors.email.message}</p>}
                    </section>

                    <section className="auth__group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="auth__passwordWrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                id="password"
                                disabled={isLoading}
                                {...register("password", {
                                    required: "La contraseña es obligatoria"
                                })}
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
                        {errors.password && <p className="auth__error">{errors.password.message}</p>}
                    </section>

                    <FormControlLabel
                        control={
                            <Checkbox
                                defaultChecked
                                disabled={isLoading}
                                {...register("rememberMe")}
                            />
                        }
                        label="Recordarme"
                    />

                    <Link to={PATHS.FORGOT_PASSWORD} className="auth__forgot-link">
                        ¿Olvidaste tu contraseña?
                    </Link>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>

                    <p className="auth__other">
                        ¿No tienes cuenta?
                        <Link to={PATHS.SIGNUP}>
                            <Button variant="text" disabled={isLoading}>Regístrate</Button>
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

export default SignIn;