import { Link } from "react-router-dom";
import Button from "../UI/Button";
import "./CTA.scss";
import { PATHS } from "@/constants/routes";

const CTA = () => {
    return(
        <section className="cta">
            <article className="cta__container">
                <h2>Únete a la comunidad</h2>
                <p>Miles de lectores ya comparten sus opiniones y descubren nuevas lecturas.</p>
                <Link to={PATHS.SIGNUP}>
                    <Button>
                        <span>Empezar Ahora</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7"/></svg>
                    </Button>
                </Link>
            </article>
        </section>
    )
}

export default CTA;