import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./legal.scss";

const TermsOfUse = () => {
    useSEO({
        title: `Términos de Uso | ${SITE_INFO.name}`,
        description: `Términos y condiciones de uso de ${SITE_INFO.name}.`,
        keywords: "términos, condiciones, uso, legal"
    });

    return (
        <main className="legal-page">
            <div className="legal-page__container">
                <h1>Términos de Uso</h1>
                <p className="legal-page__updated">Última actualización: 23 de mayo de 2026</p>

                <section className="legal-page__content">
                    <h2>1. Aceptación de los términos</h2>
                    <p>
                        Al acceder y utilizar {SITE_INFO.name}, aceptas estar sujeto a estos Términos de Uso. Si no estás de acuerdo con alguno de estos términos, por favor no utilices este servicio.
                    </p>

                    <h2>2. Descripción del servicio</h2>
                    <p>
                        {SITE_INFO.name} es una plataforma de gestión bibliotecaria que permite a los usuarios explorar catálogos de libros, crear listas de lectura personales, compartir libros con otros usuarios y acceder a recursos de bibliotecas asociadas.
                    </p>

                    <h2>3. Cuentas de usuario</h2>
                    <p>
                        Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Notifica inmediatamente cualquier uso no autorizado de tu cuenta.
                    </p>

                    <h2>4. Roles de usuario</h2>
                    <ul>
                        <li><strong>Lector:</strong> Puede explorar libros, crear y gestionar listas de lectura, y compartir contenido con otros usuarios.</li>
                        <li><strong>Bibliotecario:</strong> Puede gestionar el catálogo de su biblioteca, añadir nuevos libros y actualizar disponibilidad.</li>
                    </ul>

                    <h2>5. Conducta del usuario</h2>
                    <p>Te comprometes a no:</p>
                    <ul>
                        <li>Utilizar el servicio para fines ilegales o no autorizados.</li>
                        <li>Publicar contenido falso, difamatorio o inapropiado.</li>
                        <li>Intentar acceder a cuentas de otros usuarios.</li>
                        <li>Interferir con el funcionamiento normal de la plataforma.</li>
                    </ul>

                    <h2>6. Propiedad intelectual</h2>
                    <p>
                        Todo el contenido presente en {SITE_INFO.name}, incluyendo textos, gráficos, logotipos e imágenes, está protegido por derechos de autor. No puedes reproducir, distribuir o crear obras derivadas sin autorización.
                    </p>

                    <h2>7. Limitación de responsabilidad</h2>
                    <p>
                        {SITE_INFO.name} no será responsable por daños directos, indirectos, incidentales o consequenciales derivados del uso de este servicio.
                    </p>

                    <h2>8. Modificaciones del servicio</h2>
                    <p>
                        Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso.
                    </p>

                    <h2>9. Ley aplicable</h2>
                    <p>
                        Estos términos se rigen por las leyes de Colombia. Cualquier disputa será resuelta en los tribunales competentes de Medellín.
                    </p>

                    <h2>10. Contacto</h2>
                    <p>
                        Para consultas sobre estos términos, contacta a nuestro equipo en <a href="mailto:soporte@lectuaria.com">soporte@lectuaria.com</a>.
                    </p>
                </section>
            </div>
        </main>
    );
};

export default TermsOfUse;