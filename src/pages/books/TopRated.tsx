import { useEffect, useState, useCallback, useMemo } from "react";
import { useTopRatedBooks } from "@/hooks/useTopRatedBooks";
import { useGenresWithBookCount } from "@/hooks/useGenresWithBookCount";
import BookCard from "@/components/Cards/BookCard";
import { Pagination, Chip } from "@mui/material";
import { SITE_INFO } from "@/constants/siteInfo";
import "./topRated.scss";
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";

const TopRated = () => {
    const { books, totalPages, totalElements, isLoading, error, fetchTopRatedBooks, clearError } = useTopRatedBooks();

    const {
        genresWithCount: availableGenres,
        isLoading: genresLoading,
        error: genresError
    } = useGenresWithBookCount();

    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [areFiltersOpen, setAreFiltersOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTopRatedBooks({
                page: currentPage - 1,
                size: pageSize,
                genreId: selectedGenre || undefined,
                year: selectedYear || undefined
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, pageSize, selectedGenre, selectedYear, fetchTopRatedBooks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGenre, selectedYear, pageSize]);

    const handleGenreToggle = useCallback((genreId: number) => {
        setSelectedGenre(prev => prev === genreId ? null : genreId);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedGenre(null);
        setSelectedYear(null);
        clearError();
    }, [clearError]);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    }, []);

    useSEO({
        title: `Mejor Calificados | ${SITE_INFO.name}`,
        description: "Descubre los libros mejor valorados por la comunidad de Lectuaria. Las joyas de la lectura elegidas por nuestros usuarios.",
        keywords: "libros mejor calificados, top libros, recomendaciones, Lectuaria"
    });

    // Generar opciones de años desde el actual hasta 1900
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const y = [];
        for (let i = currentYear; i >= 1900; i--) {
            y.push(i);
        }
        return y;
    }, [currentYear]);

    return (
        <main className="topRated">
            <div className="topRated__container">
                <section className="topRated__header">
                    <h1>Mejor Calificados</h1>
                    <p>Las joyas literarias mejor valoradas por nuestra comunidad (Mínimo 4 estrellas y 10 calificaciones)</p>
                    <div className="topRated__actions">
                        <button type="button" onClick={() => setAreFiltersOpen(!areFiltersOpen)} className="topRated__filterbtn">
                            Filtros
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5h20M6 12h12m-9 7h6" /></svg>
                        </button>
                    </div>
                </section>

                <section className="topRated__body">
                    <aside className={`topRated__filters ${areFiltersOpen ? "open" : ""}`}>
                        <button
                            className="topRated__close__filters"
                            onClick={() => setAreFiltersOpen(false)}
                            aria-label="Cerrar filtros"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                        </button>

                        <h2>Filtros</h2>

                        <h3>Género</h3>
                        <div className="topRated__genres">
                            {genresLoading ? (
                                <p>Cargando géneros...</p>
                            ) : genresError ? (
                                <p className="error">Error al cargar géneros</p>
                            ) : availableGenres.map(genre => (
                                <Chip
                                    key={genre.id}
                                    label={genre.name}
                                    clickable
                                    color={selectedGenre === genre.id ? "primary" : "default"}
                                    onClick={() => handleGenreToggle(genre.id)}
                                    onDelete={selectedGenre === genre.id ? () => handleGenreToggle(genre.id) : undefined}
                                    className={`chip ${selectedGenre === genre.id ? "selected" : ""}`}
                                />
                            ))}
                        </div>

                        <h3>Año</h3>
                        <div className="topRated__year">
                            <select 
                                value={selectedYear || ""} 
                                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                className="topRated__select"
                            >
                                <option value="">Todos los años</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {(selectedGenre || selectedYear) && (
                            <Button
                                type="button"
                                variant="text"
                                onClick={handleClearFilters}
                                className="topRated__clear"
                            >
                                Limpiar filtros
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={() => setAreFiltersOpen(false)}
                            className="topRated__apply"
                        >
                            Aplicar filtros
                        </Button>
                    </aside>

                    <article className="topRated__container__items">
                        <div className="topRated__topbar">
                            <p className="topRated__count">
                                {totalElements} libro{totalElements !== 1 ? "s" : ""} encontrado{totalElements !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {error && (
                            <div className="topRated__error" role="alert">
                                Error: {error}
                                <Button variant="text" onClick={() => fetchTopRatedBooks({ page: 0, size: pageSize })}>
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && books.length === 0 && (
                            <p className="topRated__empty">No se encontraron libros mejor calificados con los criterios seleccionados</p>
                        )}

                        <div className="topRated__grid">
                            {!isLoading && !error && books.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                count={totalPages}
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

export default TopRated;
