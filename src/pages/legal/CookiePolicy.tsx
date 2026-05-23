import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./legal.scss";

const CookiePolicy = () => {
    useSEO({
        title: `Política de Cookies | ${SITE_INFO.name}`,
        description: `Política de cookies y tecnologías similares de ${SITE_INFO.name}.`,
        keywords: "cookies, privacidad, seguimiento, web"
    });

    return (
        <main className="legal-page">
            <div className="legal-page__container">
                <h1>Política de Cookies</h1>
                <p className="legal-page__updated">Última actualización: 23 de mayo de 2026</p>

                <section className="legal-page__content">
                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>
                        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Ayudan a que el sitio recuerde tus preferencias y mejore tu experiencia de navegación.
                    </p>

                    <h2>2. Tipos de cookies que usamos</h2>
                    
                    <h3>2.1 Cookies esenciales</h3>
                    <p>
                        Necesarias para el funcionamiento básico del sitio. Incluyen cookies de sesión, autenticación y seguridad.
                    </p>
                    <ul>
                        <li><strong>session_id:</strong> Mantiene tu sesión activa.</li>
                        <li><strong>auth_token:</strong> Recuerda tu estado de autenticación.</li>
                    </ul>

                    <h3>2.2 Cookies de funcionalidad</h3>
                    <p>
                        Permiten recordar tus preferencias y configuraciones.
                    </p>
                    <ul>
                        <li><strong>theme:</strong> Recuerda tu preferencia de tema (claro/oscuro).</li>
                        <li><strong>language:</strong> Recuerda tu idioma preferido.</li>
                    </ul>

                    <h3>2.3 Cookies analíticas</h3>
                    <p>
                        Nos ayudan a entender cómo los usuarios utilizan el sitio.
                    </p>
                    <ul>
                        <li><strong>_ga, _gid:</strong> Google Analytics para estadísticas de uso.</li>
                        <li>Nos permiten mejorar la experiencia del usuario.</li>
                    </ul>

                    <h2>3. Cómo usamos las cookies</h2>
                    <ul>
                        <li>Mantener tu sesión activa mientras navegas.</li>
                        <li>Recordar tus preferencias de usuario.</li>
                        <li>Analizar el tráfico del sitio para mejorar servicios.</li>
                        <li>Mostrar contenido relevante basado en tu actividad.</li>
                    </ul>

                    <h2>4. Gestión de cookies</h2>
                    <p>
                        Puedes controlar y gestionar las cookies de varias formas:
                    </p>
                    <ul>
                        <li><strong>Configuración del navegador:</strong> La mayoría de navegadores permiten bloquear o eliminar cookies.</li>
                        <li><strong>Preferencias del sitio:</strong> Aún estamos implementando opciones de gestión de cookies desde la plataforma.</li>
                        <li><strong>Herramientas de terceros:</strong> Puedes optar por no participar en análisis mediante extensiones del navegador.</li>
                    </ul>

                    <h2>5. Cookies de terceros</h2>
                    <p>
                        Algunos servicios que usamos establecen cookies:
                    </p>
                    <ul>
                        <li><strong>Google Analytics:</strong> Para estadísticas de uso anónimas.</li>
                        <li><strong>APIs externas:</strong> Cuando cargas contenido de OpenLibrary u otras APIs, pueden establecer sus propias cookies.</li>
                    </ul>

                    <h2>6. Impacto al deshabilitar cookies</h2>
                    <p>
                        Si deshabilitas las cookies, es posible que algunas funcionalidades no funcionen correctamente:
                    </p>
                    <ul>
                        <li>No podrás mantener la sesión iniciada.</li>
                        <li>Las preferencias no se guardarán.</li>
                        <li>Algunas funciones pueden mostrar errores.</li>
                    </ul>

                    <h2>7. Actualizaciones</h2>
                    <p>
                        Actualizamos esta política cuando agregamos nuevas cookies o cambiamos nuestro uso de las existentes.
                    </p>

                    <h2>8. Contacto</h2>
                    <p>
                        Para consultas sobre cookies: <a href="mailto:cookies@lectuaria.com">cookies@lectuaria.com</a>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default CookiePolicy;