import { SITE_INFO } from "@/constants/siteInfo";
import "./404.scss"
import useSEO from "@/hooks/useSEO";

const NotFound = () => {
    useSEO({
        title: `Página no encontrada | ${SITE_INFO.name}`,
        description: `La página que buscas no existe en ${SITE_INFO.name}.`,
        keywords: "404, no encontrado, error, libros"
    });

    return (
        <main className="notFound">
            <h2>Not Found</h2>
        </main>
    )
}

export default NotFound;