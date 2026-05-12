import type { Feature } from "@/types";
import FeatureCard from "../Cards/FeatureCard";
import "./features.scss";

const features: Feature[] = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
        ),
        title: "Descubre Libros",
        description: "Explora un catálogo completo con reseñas y calificaciones de la comunidad.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></g></svg>
        ),
        title: "Conecta con Lectores",
        description: "Añade amigos, comparte listas y descubre qué leen los demás.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z" /></svg>
        ),
        title: "Reseña y Califica",
        description: "Comparte tu opinión y ayuda a otros a encontrar su próxima lectura.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 6l4 14M12 6v14M8 8v12M4 4v16" /></svg>
        ),
        title: "Bibliotecas de Medellín",
        description: "Encuentra dónde conseguir libros en la red de bibliotecas públicas.",
    },
];

const Features = () => {
    return (
        <section className="features">
            <article className="features__header">
                <h2>Todo para tu vida literaria</h2>
                <p>Una plataforma completa para descubrir, organizar y compartir tu pasión por los libros.</p>
            </article>

            <article className="features__grid">
                {
                    features.length > 0 ?
                        (
                            features.map(feature => <FeatureCard feature={feature} key={feature.title} />)
                        )
                        :
                        <p>No hay features</p>
                }
            </article>
        </section>
    )
}

export default Features;