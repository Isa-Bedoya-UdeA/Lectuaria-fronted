import { useEffect, useState, useCallback, useMemo } from "react";
import { useBooks } from "@/hooks/useBooks";
import { useSearchBooks } from "@/hooks/useSearchBooks";
import { useBooksByGenre } from "@/hooks/useBooksByGenre";
import { useGenresWithBookCount } from "@/hooks/useGenresWithBookCount";
import { useLibraries } from "@/hooks/useLibraries";
import BookCard from "@/components/Cards/BookCard";
import { Pagination, Rating, Chip } from "@mui/material";
import { SITE_INFO } from "@/constants/siteInfo";
import "./books.scss";
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";
import ManualYearRangePicker from "@/components/UI/ManualYearRangePicker";

const Books = () => {
    const initialParams = useMemo(() => ({ size: 6 }), []);

    const { books, pagination, isLoading, error, fetchBooks, clearError } =
        useBooks(initialParams);

    const {
        results: searchResults,
        pagination: searchPagination,
        isLoading: isSearching,
        error: searchError,
        search: searchBooksByKeywords,
        clearError: clearSearchError
    } = useSearchBooks();

    const {
        books: genreBooks,
        pagination: genrePagination,
        isLoading: isFilteringByGenre,
        error: genreError,
        fetchByGenres,
        clearError: clearGenreError
    } = useBooksByGenre();

    // Hook para géneros con conteo de libros
    const {
        genresWithCount: availableGenres,
        isLoading: genresLoading,
        error: genresError
    } = useGenresWithBookCount();

    // Hook para bibliotecas
    const {
        libraries: availableLibraries,
        isLoading: librariesLoading,
        error: librariesError
    } = useLibraries();

    // Estados locales para filtros
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [selectedLibraries, setSelectedLibraries] = useState<number[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [startYear, setStartYear] = useState<number | null>(null);
    const [endYear, setEndYear] = useState<number | null>(null);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [areFiltersOpen, setAreFiltersOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Forzar modo grid en móvil y permitir cambio solo desde 500px
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 500;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('grid'); // Forzar grid en móvil
            }
        };

        // Guardar origen para el botón "Regresar" de BookDetail
        localStorage.setItem("lectuaria_back_path", "/books");

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Función para cambiar vista con validación móvil
    const handleViewModeChange = (mode: 'grid' | 'list') => {
        if (!isMobile) {
            setViewMode(mode);
        }
    };

    // Determinar qué datos mostrar según el modo de filtrado
    const isSearchingMode = searchQuery.trim().length > 0 || selectedLibraries.length > 0 || selectedGenres.length > 0;
    const isGenreFilterMode = false; // Simplificado: siempre usar búsqueda múltiple

    const displayedBooks = isSearchingMode
        ? searchResults
        : isGenreFilterMode
            ? genreBooks
            : books;

    const displayedPagination = isSearchingMode
        ? searchPagination
        : isGenreFilterMode
            ? genrePagination
            : pagination;

    const displayedLoading = isSearchingMode
        ? isSearching
        : isGenreFilterMode
            ? isFilteringByGenre
            : isLoading;

    const displayedError = isSearchingMode
        ? searchError
        : isGenreFilterMode
            ? genreError
            : error;

    // Ejecutar búsqueda cuando cambie el query, bibliotecas o géneros
    useEffect(() => {
        if (searchQuery.trim().length >= 3 || selectedLibraries.length > 0 || selectedGenres.length > 0) {
            const debounceTimer = setTimeout(() => {
                searchBooksByKeywords(searchQuery.trim(), selectedLibraries, selectedGenres, currentPage - 1, pageSize, startYear, endYear, selectedFormats, minRating);
            }, 300);
            return () => clearTimeout(debounceTimer);
        } else if (searchQuery.trim().length === 0 && selectedLibraries.length === 0 && selectedGenres.length === 0) {
            fetchBooks({ page: currentPage - 1, size: pageSize, startYear: startYear || undefined, endYear: endYear || undefined, formatTypes: selectedFormats.length > 0 ? selectedFormats : undefined });
        }
    }, [searchQuery, selectedLibraries, selectedGenres, currentPage, pageSize, searchBooksByKeywords, fetchBooks, startYear, endYear, selectedFormats, minRating]);

    // Ejecutar filtro por géneros cuando cambien
    useEffect(() => {
        if (selectedGenres.length > 0 && !isSearchingMode) {
            fetchByGenres(selectedGenres, currentPage - 1, pageSize);
        } else if (searchQuery.trim().length === 0 && selectedLibraries.length === 0) {
            fetchBooks({
                page: currentPage - 1,
                size: pageSize,
                minRating: minRating > 0 ? minRating : undefined,
                startYear: startYear || undefined,
                endYear: endYear || undefined
            });
        }
    }, [selectedGenres, currentPage, pageSize, fetchByGenres, fetchBooks, searchQuery, selectedLibraries, minRating, startYear, endYear, isSearchingMode]);

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGenres, selectedLibraries, minRating, startYear, endYear, selectedFormats, pageSize]);

    // Handlers
    const handleGenreToggle = useCallback((genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    }, []);

    const handleLibraryToggle = useCallback((libraryId: number) => {
        setSelectedLibraries(prev =>
            prev.includes(libraryId)
                ? prev.filter(id => id !== libraryId)
                : [...prev, libraryId]
        );
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedGenres([]);
        setSelectedLibraries([]);
        setMinRating(0);
        setStartYear(null);
        setEndYear(null);
        setSelectedFormats([]);
        setSearchQuery("");
        clearError();
        clearSearchError();
        clearGenreError();
    }, [clearError, clearSearchError, clearGenreError]);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1);
    }, []);

    // SEO
    useSEO({
        title: `Libros | ${SITE_INFO.name}`,
        description: "Explora nuestro catálogo completo de libros. Filtra por género, calificación y encuentra tu próxima gran lectura.",
        keywords: "libros, catálogo, biblioteca, Medellín, Colombia, lectura, reseñas, lectores"
    });

    return (
        <main className="books">
            <div className="books__container">
                <section className="books__header">
                    <h1>Catálogo de Libros</h1>
                    <p>Explora, busca y descubre tu próxima lectura</p>
                    <form className="books__search" onSubmit={e => e.preventDefault()}>
                        <article className="books__searchbar">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar por título, autor o género..."
                            />
                            <svg className="books__search__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="m21 21l-4.34-4.34" /><circle cx="11" cy="11" r="8" /></g></svg>
                        </article>
                        <button type="button" onClick={() => setAreFiltersOpen(!areFiltersOpen)}>
                            <svg className="books__filterbtn" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5h20M6 12h12m-9 7h6" /></svg>
                        </button>
                    </form>
                </section>

                <section className="books__body">
                    <aside className={`books__filters ${areFiltersOpen ? "open" : ""}`}>
                        <button
                            className="books__close__filters"
                            onClick={() => setAreFiltersOpen(false)}
                            aria-label="Cerrar filtros"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                        </button>

                        <h2>Filtros</h2>

                        <h3>Género</h3>
                        <div className="books__genres">
                            {genresLoading ? (
                                <p>Cargando géneros...</p>
                            ) : genresError ? (
                                <p className="error">Error al cargar géneros</p>
                            ) : availableGenres.map(genre => {
                                const hasBooks = genre.bookCount > 0;
                                return (
                                    <Chip
                                        key={genre.id}
                                        label={genre.name}
                                        clickable={hasBooks}
                                        color={selectedGenres.includes(genre.id) ? "primary" : "default"}
                                        onClick={() => hasBooks && handleGenreToggle(genre.id)}
                                        onDelete={selectedGenres.includes(genre.id) && hasBooks ? () => handleGenreToggle(genre.id) : undefined}
                                        className={`chip ${selectedGenres.includes(genre.id) ? "selected" : ""} ${!hasBooks ? "disabled" : ""}`}
                                        title={genre.description}
                                        disabled={!hasBooks}
                                    />
                                );
                            })}
                        </div>

                        <h3>Biblioteca</h3>
                        <div className="books__genres">
                            {librariesLoading ? (
                                <p>Cargando bibliotecas...</p>
                            ) : librariesError ? (
                                <p className="error">Error al cargar bibliotecas</p>
                            ) : availableLibraries.map(library => (
                                <Chip
                                    key={library.id}
                                    label={library.name}
                                    clickable
                                    color={selectedLibraries.includes(library.id) ? "primary" : "default"}
                                    onClick={() => handleLibraryToggle(library.id)}
                                    onDelete={selectedLibraries.includes(library.id) ? () => handleLibraryToggle(library.id) : undefined}
                                    className={`chip ${selectedLibraries.includes(library.id) ? "selected" : ""}`}
                                    title={library.description}
                                />
                            ))}
                        </div>

                        <h3>Calificación mínima</h3>
                        <div className="books__rating">
                            <Rating
                                name="min-rating"
                                value={minRating}
                                precision={0.5}
                                onChange={(_, value) => setMinRating(value || 0)}
                            />
                            {minRating > 0 && (
                                <Button
                                    type="button"
                                    variant="text"
                                    onClick={() => setMinRating(0)}
                                    className="books__clear"
                                >
                                    Quitar rating
                                </Button>
                            )}
                        </div>

                        <ManualYearRangePicker
                            startYear={startYear}
                            endYear={endYear}
                            onStartYearChange={setStartYear}
                            onEndYearChange={setEndYear}
                        />

                        <h3>Formato</h3>
                        <div className="books__formats">
                            <Chip
                                label="Físico"
                                clickable
                                color={selectedFormats.includes("physical") ? "primary" : "default"}
                                onClick={() => {
                                    setSelectedFormats(prev =>
                                        prev.includes("physical")
                                            ? prev.filter(f => f !== "physical")
                                            : [...prev, "physical"]
                                    );
                                }}
                                onDelete={selectedFormats.includes("physical") ? () => {
                                    setSelectedFormats(prev => prev.filter(f => f !== "physical"));
                                } : undefined}
                                className={`chip ${selectedFormats.includes("physical") ? "selected" : ""}`}
                            />
                            <Chip
                                label="Digital"
                                clickable
                                color={selectedFormats.includes("digital") ? "primary" : "default"}
                                onClick={() => {
                                    setSelectedFormats(prev =>
                                        prev.includes("digital")
                                            ? prev.filter(f => f !== "digital")
                                            : [...prev, "digital"]
                                    );
                                }}
                                onDelete={selectedFormats.includes("digital") ? () => {
                                    setSelectedFormats(prev => prev.filter(f => f !== "digital"));
                                } : undefined}
                                className={`chip ${selectedFormats.includes("digital") ? "selected" : ""}`}
                            />
                        </div>

                        {(selectedGenres.length > 0 || minRating > 0 || searchQuery || startYear || endYear || selectedFormats.length > 0) && (
                            <Button
                                type="button"
                                variant="text"
                                onClick={handleClearFilters}
                                className="books__clear"
                            >
                                Limpiar filtros
                            </Button>
                        )}

                        <Button
                            type="button"
                            onClick={() => setAreFiltersOpen(false)}
                            className="books__apply"
                        >
                            Aplicar filtros
                        </Button>
                    </aside>

                    <article className="books__container__items">
                        <div className="books__topbar">
                            <p className="books__count">
                                {displayedPagination?.totalElements ?? 0} libro{displayedPagination?.totalElements !== 1 ? "s" : ""} encontrado{displayedPagination?.totalElements !== 1 ? "s" : ""}
                            </p>

                            <div className="books__controls">
                                <div className="books__perpage">
                                    <label htmlFor="perPage">Mostrar:</label>
                                    <select
                                        id="perPage"
                                        value={pageSize}
                                        onChange={handlePageSizeChange}
                                    >
                                        <option value={6}>6</option>
                                        <option value={9}>9</option>
                                        <option value={12}>12</option>
                                        <option value={18}>18</option>
                                    </select>
                                </div>
                                {window.innerWidth > 500 && (
                                    <div className="books__view-toggle">
                                        <input
                                            type="radio"
                                            id="grid-view"
                                            name="view-mode"
                                            checked={viewMode === 'grid'}
                                            onChange={() => handleViewModeChange('grid')}
                                        />
                                        <label htmlFor="grid-view" title="Vista cuadrícula">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></g></svg>
                                        </label>

                                        <input
                                            type="radio"
                                            id="list-view"
                                            name="view-mode"
                                            checked={viewMode === 'list'}
                                            onChange={() => handleViewModeChange('list')}
                                        />
                                        <label htmlFor="list-view" title="Vista lista">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13" /></svg>
                                        </label>
                                    </div>
                                )}

                            </div>
                            {displayedError && (
                                <div className="books__error" role="alert">
                                    Error: {displayedError}
                                    <Button variant="text" onClick={() => {
                                        clearError();
                                        clearSearchError();
                                        clearGenreError();
                                        fetchBooks({ page: 0, size: pageSize });
                                    }}>
                                        Reintentar
                                    </Button>
                                </div>
                            )}

                            {!displayedLoading && !displayedError && displayedBooks.length === 0 && (
                                <p className="books__empty">No se encontraron libros con los criterios seleccionados</p>
                            )}
                        </div>

                        <div className={viewMode === 'grid' ? 'books__grid' : 'books__list'}>
                            {!displayedLoading && !displayedError && displayedBooks.map(book => (
                                <BookCard key={book.id} book={book} viewMode={viewMode} />
                            ))}
                        </div>

                        {displayedPagination?.totalPages > 1 && (
                            <Pagination
                                count={displayedPagination.totalPages}
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

export default Books;