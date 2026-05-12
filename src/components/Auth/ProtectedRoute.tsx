import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";
import "./protectedRoute.scss";
import { type UserRole } from "@/types/auth.ts";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    useSEO({
        title: !isAuthenticated
            ? `Iniciar Sesión | ${SITE_INFO.name}`
            : (allowedRole && user?.userRole !== allowedRole
                ? `Acceso Restringido | ${SITE_INFO.name}`
                : ""),
        description: !isAuthenticated
            ? "Esta es una página protegida. Inicia sesión para acceder a tu historial y listas de libros."
            : "No tienes permisos suficientes para ver esta sección.",
    });

    if (isLoading) {
        return (
            <div className="protected__loading">
                <div className="spinner"></div>
                <p>Verificando acceso...</p>
            </div>
        );
    }

    const getDeniedMessage = () => {
        const path = window.location.pathname;
        if (path.startsWith(PATHS.LISTS)) return "tus Listas de lectura";
        if (path.startsWith(PATHS.PROFILE)) return "tu Perfil";
        if (path.startsWith(PATHS.MY_LIBRARY)) return "tu Biblioteca";
        return "esta sección";
    };

    if (!isAuthenticated || !user) {
        return (
            <main className="protected__denied">
                <section className="protected__card">
                    <div className="protected__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M12 10V7a4 4 0 1 0-8 0v3" /><rect width="12" height="10" x="2" y="10" rx="2" /><path d="M15 15h7m-3-3v6" /></g></svg>
                    </div>
                    <h1>Inicia Sesión</h1>
                    <p>Necesitas tener una cuenta e iniciar sesión para acceder a <strong>{getDeniedMessage()}</strong>.</p>
                    <div className="protected__actions">
                        <Link to={PATHS.SIGNIN}>
                            <Button>Iniciar Sesión</Button>
                        </Link>
                        <Link to={PATHS.SIGNUP}>
                            <Button variant="text">¿No tienes cuenta? Regístrate</Button>
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (allowedRole && user.userRole !== allowedRole) {
        const roleName = allowedRole === "LIBRARIAN" ? "Biblioteca" :
            allowedRole === "ADMIN" ? "Administrador" : "Lector";

        return (
            <main className="protected__denied">
                <section className="protected__card">
                    <div className="protected__icon error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2a10 10 0 1 0 10 10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                    </div>
                    <h1>Permiso Denegado</h1>
                    <p>Esta página es exclusiva para usuarios de tipo <strong>{roleName}</strong>.</p>
                    <div className="protected__actions">
                        <Link to={PATHS.HOME}>
                            <Button variant="outlined">Volver al catálogo</Button>
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;