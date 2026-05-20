import useSEO from "@/hooks/useSEO";
import CTA from "@/components/Home/CTA";
import FeaturedBooks from "@/components/Home/FeaturedBooks";
import Features from "@/components/Home/Features";
import Hero from "@/components/Home/Hero";
import NewBooks from "@/components/Home/NewBooks";
import RecommendedBooks from "@/components/Home/RecommendedBooks";
import { SITE_INFO } from "@/constants/siteInfo";
import "./home.scss";

const Home = () => {
    useSEO({
        title: `Inicio | ${SITE_INFO.name}`,
        description: "Bienvenido a Lectuaria, la mejor comunidad para amantes de los libros en Medellín, Colombia. Descubre, comparte y conecta.",
        keywords: "libros, lectura, Medellín, Colombia, biblioteca, comunidad, reseñas"
    });

    return (
        <main className="home">
            <Hero />
            <Features />
            <RecommendedBooks />
            <FeaturedBooks />
            <NewBooks />
            <CTA />
        </main>
    );
}

export default Home;