import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./legal.scss";

const PrivacyPolicy = () => {
    useSEO({
        title: `Política de Privacidad | ${SITE_INFO.name}`,
        description: `Política de privacidad y protección de datos de ${SITE_INFO.name}.`,
        keywords: "privacidad, protección, datos, personal"
    });

    return (
        <main className="legal-page">
            <div className="legal-page__container">
                <h1>Política de Privacidad</h1>
                <p className="legal-page__updated">Última actualización: 23 de mayo de 2026</p>

                <section className="legal-page__content">
                    <h2>1. Información que recopilamos</h2>
                    <p>Recopilamos la siguiente información cuando te registras y utilizas nuestros servicios:</p>
                    <ul>
                        <li><strong>Datos de registro:</strong> Nombre, correo electrónico, contraseña (encriptada), rol de usuario.</li>
                        <li><strong>Datos de perfil:</strong> Fotografía, nombre de usuario, preferencias de lectura.</li>
                        <li><strong>Datos de actividad:</strong> Listas creadas, libros calificados, reseñas escritas, amistades.</li>
                        <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, páginas visitadas.</li>
                    </ul>

                    <h2>2. Uso de la información</h2>
                    <p>Utilizamos tu información para:</p>
                    <ul>
                        <li>Proporcionar y mantener nuestros servicios.</li>
                        <li>Personalizar tu experiencia de usuario.</li>
                        <li>Comunicarte actualizaciones y notificaciones.</li>
                        <li>Mejorar la seguridad de la plataforma.</li>
                        <li>Cumplir obligaciones legales.</li>
                    </ul>

                    <h2>3. Protección de datos</h2>
                    <p>
                        Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado, alteration, divulgación o destrucción.
                    </p>

                    <h2>4. Compartir información</h2>
                    <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:</p>
                    <ul>
                        <li>Cuando nos hayas dado tu consentimiento.</li>
                        <li>Para cumplir con requisitos legales.</li>
                        <li>Para proteger nuestros derechos y seguridad.</li>
                    </ul>

                    <h2>5. Tus derechos</h2>
                    <p>Tienes derecho a:</p>
                    <ul>
                        <li>Acceder a tus datos personales.</li>
                        <li>Corregir datos inexactos.</li>
                        <li>Solicitar la eliminación de tu cuenta.</li>
                        <li>Retirar tu consentimiento en cualquier momento.</li>
                        <li>Exportar tus datos en formato legible.</li>
                    </ul>

                    <h2>6. Cookies</h2>
                    <p>
                        Utilizamos cookies para mejorar tu experiencia. Consulta nuestra <a href="/cookies">Política de Cookies</a> para más detalles.
                    </p>

                    <h2>7. Retención de datos</h2>
                    <p>
                        Conservamos tus datos mientras tu cuenta esté activa o según sea necesario para proporcionar servicios. Los datos pueden retenerse por períodos más largos para cumplimiento legal.
                    </p>

                    <h2>8. Menores de edad</h2>
                    <p>
                        Nuestros servicios no están dirigidos a menores de 13 años. No recopilamos intencionalmente información de menores.
                    </p>

                    <h2>9. Cambios a esta política</h2>
                    <p>
                        Actualizamos esta política periódicamente. Notificaremos cambios significativos a través de correo electrónico o un aviso en la plataforma.
                    </p>

                    <h2>10. Contacto</h2>
                    <p>
                        Para ejercer tus derechos o consultas sobre privacidad: <a href="mailto:privacidad@lectuaria.com">privacidad@lectuaria.com</a>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default PrivacyPolicy;