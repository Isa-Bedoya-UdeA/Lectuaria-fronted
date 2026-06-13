import { useState, useEffect, useRef } from "react";
import { getNewBooks } from "@/services/newBooksService";
import type { BookSummary } from "@/types";
import BookCard from "@/components/Cards/BookCard";
import Button from "@/components/UI/Button";
import "./newBooks.scss";
import { PATHS } from "@/constants/routes";
import { Link } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorMessage";

const NewBooks = () => {
    const [books, setBooks] = useState<BookSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNewBooks = async () => {
            try {
                const response = await getNewBooks({ page: 0, size: 8 });
                setBooks(response.content);
            } catch (err: any) {
                setError(getErrorMessage(err, "No se pudieron cargar los libros nuevos. Intenta de nuevo en unos momentos."));
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewBooks();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return (
            <section className="newBooks">
                <div className="newBooks__container">
                    <div className="newBooks__header">
                        <h2>Libros Nuevos</h2>
                    </div>
                    <div className="newBooks__loading">
                        Cargando libros nuevos...
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="newBooks">
                <div className="newBooks__container">
                    <div className="newBooks__header">
                        <h2>Libros Nuevos</h2>
                    </div>
                    <div className="newBooks__error">
                        <p>{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Reintentar
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (books.length === 0) {
        return (
            <section className="newBooks">
                <div className="newBooks__container">
                    <div className="newBooks__header">
                        <h2>Libros Nuevos</h2>
                    </div>
                    <div className="newBooks__empty">
                        <p>No hay libros nuevos disponibles en este momento.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="newBooks">
            <div className="newBooks__container">
                <div className="newBooks__header">
                    <div>
                        <h2>Libros Nuevos</h2>
                        <p className="newBooks__subtitle">
                            Descubre los libros más recientes añadidos a nuestra biblioteca
                        </p>
                    </div>
                    <Link to={PATHS.BOOKS}>
                        <Button variant="text">
                            <span>Ver más</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                        </Button>
                    </Link>
                </div>
                
                <div className="newBooks__carousel-container">
                    <button 
                        className="newBooks__nav-button prev" 
                        onClick={() => scroll('left')}
                        aria-label="Anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    
                    <div className="newBooks__carousel" ref={carouselRef}>
                        {books.map(book => (
                            <div className="newBooks__carousel-item" key={book.id}>
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>

                    <button 
                        className="newBooks__nav-button next" 
                        onClick={() => scroll('right')}
                        aria-label="Siguiente"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewBooks;
