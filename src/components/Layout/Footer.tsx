import { SITE_INFO } from "@/constants/siteInfo";
import "./footer.scss";
import { Link } from "react-router-dom";
import { PATHS } from "@/constants/routes";

const Footer = () => {
    return (
        <footer>
            <section className="footer__columns">
                <article className="footer__brand">
                    <div className="footer__logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M11 22H5.5a1 1 0 0 1 0-5h4.501M21 22l-1.879-1.878" /><path d="M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8" /><circle cx="17" cy="18" r="3" /></g></svg>
                        <span>{SITE_INFO.name}</span>
                    </div>
                    <p>{SITE_INFO.description}</p>
                </article>
                <article className="footer__explore">
                    <h3>Explorar</h3>
                    <Link to={PATHS.BOOKS}>Catálogo de Libros</Link>
                    <Link to={PATHS.LISTS}>Listas de Lectura</Link>
                    <Link to={PATHS.SIGNUP}>Crear Cuenta</Link>
                </article>
                <article className="footer__legal">
                    <h3>Legal</h3>
                    <a href="">Términos de Uso</a>
                    <a href="">Privacidad</a>
                    <a href="">Cookies</a>
                </article>
                <article className="footer__libraries">
                    <h3>Bibliotecas</h3>
                    <a href="https://bibliotecasmedellin.gov.co/nuestras-bibliotecas/" target="_blank">
                        Sistema de Bibliotecas de Medellín <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6m10 0l-9 9m3-9h6v6" /></svg>
                    </a>
                </article>
            </section>
            <section className="footer__copyright">
                <p>© 2026 {SITE_INFO.name}. Hecho con 📚 en Medellín, Colombia.</p>
            </section>
        </footer>
    )
}

export default Footer;