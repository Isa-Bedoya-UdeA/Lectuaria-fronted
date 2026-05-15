import BookCard from "../Cards/BookCard";
import { useFeaturedSections } from "@/hooks/useFeaturedSections";
import "./featuredBooks.scss";
import Button from "../UI/Button";
import { useEffect, useRef } from "react";
import type { BookSummary } from "@/types";

const CarouselSection = ({ title, description, books, moreLink }: { title: string, description: string, books: BookSummary[], moreLink: string }) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <article className="featuredBooks__section">
            <div className="featuredBooks__header">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                {books && books.length > 0 && moreLink && (
                    <a href={moreLink}>
                        <Button variant="text">
                            <span>Ver más</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                        </Button>
                    </a>
                )}
            </div>

            {!books || books.length === 0 ? (
                <div className="featuredBooks__empty">
                    <p>Todavía no hay libros para mostrar en esta sección.</p>
                </div>
            ) : (
                <div className="featuredBooks__carousel-container">
                    <button
                        className="featuredBooks__nav-button prev"
                        onClick={() => scroll('left')}
                        aria-label="Anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    <div className="featuredBooks__carousel" ref={carouselRef}>
                        {books.map(book => (
                            <div className="featuredBooks__carousel-item" key={book.id}>
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>

                    <button
                        className="featuredBooks__nav-button next"
                        onClick={() => scroll('right')}
                        aria-label="Siguiente"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            )}
        </article>
    );
};

const FeaturedBooks = () => {
    const {
        sections,
        isLoading,
        error,
        fetchFeaturedSections,
        clearError
    } = useFeaturedSections();

    useEffect(() => {
        fetchFeaturedSections().catch(err => {
            console.error("Error loading featured sections:", err);
        });
    }, [fetchFeaturedSections]);

    return (
        <section className="featuredBooks">
            <div className="featuredBooks__container">
                {isLoading && <div className="featuredBooks__loading">Cargando secciones destacadas...</div>}

                {error && (
                    <div className="featuredBooks__error" role="alert">
                        Error al cargar secciones destacadas
                        <Button variant="text" onClick={() => {
                            clearError();
                            fetchFeaturedSections();
                        }}>
                            Reintentar
                        </Button>
                    </div>
                )}

                {!isLoading && !error && sections && (
                    <>
                        <CarouselSection
                            title="Más leídos este mes"
                            description="Los libros más populares recientemente"
                            books={sections.mostReadThisMonth}
                            moreLink=""
                        />
                        <CarouselSection
                            title="Mejor calificados"
                            description="Las joyas mejor valoradas por la comunidad"
                            books={sections.topRated}
                            moreLink=""
                        />
                    </>
                )}
            </div>
        </section>
    );
}

export default FeaturedBooks;