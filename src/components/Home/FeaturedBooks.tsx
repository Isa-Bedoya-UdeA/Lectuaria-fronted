import BookCard from "../Cards/BookCard";
import { usePopularBooks } from "@/hooks/usePopularBooks"; // ← Hook nuevo
import "./featuredBooks.scss";
import Button from "../UI/Button";
import { useEffect } from "react";

const FeaturedBooks = () => {
    const {
        books,
        isLoading,
        error,
        fetchPopularBooks,
        clearError
    } = usePopularBooks();

    // Cargar libros populares al montar el componente
    useEffect(() => {
        fetchPopularBooks({ size: 5 }).catch(err => {
            console.error("Error loading featured books:", err);
        });
    }, [fetchPopularBooks]);

    return (
        <section className="featuredBooks">
            <div className="featuredBooks__container">
                <article className="featuredBooks__header">
                    <div>
                        <h2>Libros Destacados</h2>
                        <p>Los más populares de la comunidad</p>
                    </div>
                    <a href="/books">
                        <Button variant="text">
                            <span>Ver todos</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                        </Button>
                    </a>
                </article>

                <article className="featuredBooks__body">
                    {isLoading && <div className="featuredBooks__loading">Cargando libros destacados...</div>}

                    {error && (
                        <div className="featuredBooks__error" role="alert">
                            Error al cargar libros destacados
                            <Button variant="text" onClick={() => {
                                clearError();
                                fetchPopularBooks({ size: 5 });
                            }}>
                                Reintentar
                            </Button>
                        </div>
                    )}

                    {!isLoading && !error && books.length > 0 ? (
                        <div className="featuredBooks__grid">
                            {books.map(book => (
                                <BookCard book={book} key={book.id} />
                            ))}
                        </div>
                    ) : !isLoading && !error ? (
                        <p className="featuredBooks__empty">No hay libros destacados disponibles</p>
                    ) : null}
                </article>
            </div>
        </section>
    );
}

export default FeaturedBooks;