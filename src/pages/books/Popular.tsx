import { useEffect, useState, useCallback } from "react";
import { usePopularBooks } from "@/hooks/usePopularBooks";
import BookCard from "@/components/Cards/BookCard";
import { Pagination } from "@mui/material";
import { SITE_INFO } from "@/constants/siteInfo";
import "./topRated.scss"; // Reusando los estilos de topRated
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";

const Popular = () => {
    const { books, pagination, isLoading, error, fetchPopularBooks, clearError } = usePopularBooks();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => {
        fetchPopularBooks({
            page: currentPage - 1,
            size: pageSize,
        });
    }, [currentPage, pageSize, fetchPopularBooks]);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    }, []);

    useSEO({
        title: `Más Leídos | ${SITE_INFO.name}`,
        description: "Descubre los libros más populares y leídos por la comunidad de Lectuaria este mes.",
        keywords: "libros más leídos, populares, tendencias, Lectuaria"
    });

    return (
        <main className="topRated">
            <div className="topRated__container">
                <section className="topRated__header">
                    <h1>Más Leídos</h1>
                    <p>Los libros más populares y añadidos a listas recientemente</p>
                </section>

                <section className="topRated__body">
                    <article className="topRated__container__items" style={{ width: '100%' }}>
                        <div className="topRated__topbar">
                            <p className="topRated__count">
                                {pagination?.totalElements ?? 0} libro{pagination?.totalElements !== 1 ? "s" : ""} encontrado{pagination?.totalElements !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {error && (
                            <div className="topRated__error" role="alert">
                                Error: {error}
                                <Button variant="text" onClick={() => fetchPopularBooks({ page: 0, size: pageSize })}>
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && books.length === 0 && (
                            <p className="topRated__empty">No se encontraron libros populares</p>
                        )}

                        <div className="topRated__grid">
                            {!isLoading && !error && books.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>

                        {pagination?.totalPages > 1 && (
                            <Pagination
                                count={pagination.totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        )}
                    </article>
                </section>
            </div>
        </main>
    );
};

export default Popular;
