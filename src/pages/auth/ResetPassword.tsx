import { useNavigate, useSearchParams } from "react-router-dom";
import "./auth.scss";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Button from "@/components/UI/Button";
import Toast, { type ToastType } from "@/components/UI/Toast";
import useSEO from "@/hooks/useSEO";
import api from "@/config/api";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface ResetPasswordInputs {
    newPassword: string;
    confirmPassword: string;
}

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const { register, handleSubmit, watch, formState: { errors, isSubmitted } } = useForm<ResetPasswordInputs>();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const password = watch("newPassword") || "";

    useSEO({
        title: `Nueva contraseña | ${SITE_INFO.name}`,
        description: `Establece tu nueva contraseña en ${SITE_INFO.name}.`,
        keywords: "nueva contraseña, restablecer contraseña"
    });

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            navigate(PATHS.SIGNIN);
        }
    }, [token, navigate]);

    const requirements = [
        { id: 'length', label: 'Mínimo 8 caracteres', met: password.length >= 8 },
        { id: 'uppercase', label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
        { id: 'number', label: 'Al menos un número', met: /\d/.test(password) },
    ];

    const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            setToast({ message: "Las contraseñas no coinciden", type: "error" });
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/auth/reset-password", {
                token,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
            setIsSuccess(true);
            setToast({ message: "¡Contraseña actualizada correctamente!", type: "success" });
            setTimeout(() => navigate(PATHS.SIGNIN), 2000);
        } catch (err: any) {
            const message = err?.response?.data?.message || "No se pudo restablecer la contraseña. El enlace puede haber expirado.";
            setToast({ message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <main className="auth resetPassword">
            <section className="auth__header">
                <h1>Nueva Contraseña</h1>
                <p>Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.</p>
            </section>

            {isSuccess ? (
                <form>
                    <div className="auth__form">
                        <div className="auth__success-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <h2>¡Contraseña actualizada!</h2>
                            <p>Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.</p>
                        </div>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="auth__form">
                        <section className="auth__group">
                            <label htmlFor="newPassword">Nueva contraseña</label>
                            <div className="auth__passwordWrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********"
                                    disabled={isLoading}
                                    {...register("newPassword", {
                                        required: "La contraseña es requerida",
                                        validate: {
                                            length: (v) => v.length >= 8 || "Mínimo 8 caracteres",
                                            uppercase: (v) => /[A-Z]/.test(v) || "Al menos una mayúscula",
                                            number: (v) => /\d/.test(v) || "Al menos un número",
                                        }
                                    })}
                                    id="newPassword"
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
                            {errors.newPassword && <p className="auth__error">{errors.newPassword.message}</p>}
                        </section>

                        <section className="auth__group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
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
                            {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                        </Button>
                    </div>
                </form>
            )}

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

export default ResetPassword;