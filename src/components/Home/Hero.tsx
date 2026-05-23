import { Link } from "react-router-dom";
import { SITE_INFO } from "@/constants/siteInfo";
import "./hero.scss";
import Button from "../UI/Button";
import { PATHS } from "@/constants/routes";

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero__container">
                <h1>
                    Tu Red Literaria en <span>Medellín</span>
                </h1>
                <p>{SITE_INFO.description}</p>
                <article className="hero__btns">
                    <Link to={PATHS.BOOKS}>
                        <Button>
                            <span>Explorar Libros</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                        </Button>
                    </Link>
                    <Link to={PATHS.SIGNUP}>
                        <Button variant="outlined">Crear Cuenta</Button>
                    </Link>
                </article>
            </div>
        </section>
    )
}

export default Hero;