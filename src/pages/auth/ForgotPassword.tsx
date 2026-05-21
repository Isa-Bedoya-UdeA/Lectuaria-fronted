import { Link } from "react-router-dom";
import "./auth.scss";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Button from "@/components/UI/Button";
import Toast, { type ToastType } from "@/components/UI/Toast";
import useSEO from "@/hooks/useSEO";
import api from "@/config/api";

interface ForgotPasswordInputs {
    email: string;
}

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInputs>();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useSEO({
        title: `Recuperar contraseña | ${SITE_INFO.name}`,
        description: `Recupera el acceso a tu cuenta de ${SITE_INFO.name}.`,
        keywords: "recuperar contraseña, olvidar contraseña, acceso"
    });

    const onSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
        try {
            setIsLoading(true);
            await api.post("/auth/forgot-password", { email: data.email.trim().toLowerCase() });
            setIsSuccess(true);
            setToast({ message: "Revisa tu correo electrónico para recuperar tu contraseña.", type: "success" });
        } catch {
            // Always show success to prevent email enumeration
            setIsSuccess(true);
            setToast({ message: "Si el correo existe, se ha enviado un enlace de recuperación.", type: "success" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth forgotPassword">
            <section className="auth__header">
                <h1>Recuperar Contraseña</h1>
                <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
            </section>

            {isSuccess ? (
                <form>
                    <div className="auth__form">
                        <div className="auth__success-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <h2>Correo enviado</h2>
                            <p>Si tu correo está registrado en {SITE_INFO.name}, recibirás un enlace para restablecer tu contraseña. El enlace expira en 24 horas.</p>
                            <p className="auth__spam-note">¿No lo encuentras? Revisa tu carpeta de spam.</p>
                        </div>
                        <Link to={PATHS.SIGNIN} className="auth__success-link">
                            <Button variant="outlined" disabled={isLoading}>Volver al inicio de sesión</Button>
                        </Link>
                    </div>
                </form>
            ) : (
                <>
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

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                            </Button>

                            <p className="auth__other">
                                ¿Recordaste tu contraseña?
                                <Link to={PATHS.SIGNIN}>
                                    <Button variant="text" disabled={isLoading}>Inicia Sesión</Button>
                                </Link>
                            </p>
                        </div>
                    </form>
                </>
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

export default ForgotPassword;