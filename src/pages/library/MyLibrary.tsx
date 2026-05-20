import { SITE_INFO } from "@/constants/siteInfo";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@mui/material";
import useSEO from "@/hooks/useSEO";
import Button from "@/components/UI/Button";
import { PATHS } from "@/constants/routes";
import LibraryInfoForm from "@/components/Forms/LibraryInfoForm";
import BookCard from "@/components/Cards/BookCard";
import { useLibraryBooks } from "@/hooks/useLibraryBooks";
import BulkUploadModal from "@/components/Modals/BulkUploadModal";
import { getMyLibraryStatistics } from "@/services/libraryService";
import type { LibraryStatisticsDTO } from "@/types";
import "./myLibrary.scss";
// Mismos estilos que el catálogo
import "@/pages/books/books.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";

const LibraryStatisticsDashboard = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stats, setStats] = useState<LibraryStatisticsDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isExpanded && !stats) {
            setIsLoading(true);
            setError(null);
            getMyLibraryStatistics()
                .then(data => {
                    setStats(data);
                })
                .catch(err => {
                    console.error("Error fetching library statistics:", err);
                    setError("No se pudieron cargar las estadísticas de la biblioteca.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isExpanded, stats]);

    return (
        <section className="library-stats">
            <button
                className={`library-stats__toggle-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="library-stats__toggle-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 22h18M6 6h12M6 10h12M6 14h12M3 2h18v4H3zm3 4v12M18 6v12" /></svg>
                    Estadísticas del Catálogo
                </span>
                <svg className="library-stats__toggle-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9l6 6l6-6"/></svg>
            </button>

            {isExpanded && (
                <>
                    {isLoading && <div className="library-stats__loading">Cargando estadísticas...</div>}
                    {error && <div className="library-stats__error">{error}</div>}
                    {!isLoading && !error && stats && (
                        <div className="library-stats__content">
                            <div className="library-stats__grid">
                                <div className="library-stats__card">
                                    <div className="library-stats__card-icon library-stats__card-icon--primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h10M6 10h10M6 14h10"/></svg>
                                    </div>
                                    <div className="library-stats__card-info">
                                        <span className="library-stats__card-value">{stats.totalBooks}</span>
                                        <span className="library-stats__card-label">Libros Totales</span>
                                    </div>
                                </div>
                                <div className="library-stats__card">
                                    <div className="library-stats__card-icon library-stats__card-icon--success">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6M9 17h6"/></svg>
                                    </div>
                                    <div className="library-stats__card-info">
                                        <span className="library-stats__card-value">{stats.booksAddedThisMonth}</span>
                                        <span className="library-stats__card-label">Agregados este mes</span>
                                    </div>
                                </div>
                                <div className="library-stats__card">
                                    <div className="library-stats__card-icon library-stats__card-icon--secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    </div>
                                    <div className="library-stats__card-info">
                                        <span className="library-stats__card-value">
                                            {stats.averageRatingOfOwnBooks ? stats.averageRatingOfOwnBooks.toFixed(1) : "0.0"} <span className="library-stats__card-star">⭐</span>
                                        </span>
                                        <span className="library-stats__card-label">Calificación Promedio</span>
                                    </div>
                                </div>
                                <div className="library-stats__card">
                                    <div className="library-stats__card-icon library-stats__card-icon--info">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    </div>
                                    <div className="library-stats__card-info">
                                        <span className="library-stats__card-value">{stats.reviewsOnOwnBooks}</span>
                                        <span className="library-stats__card-label">Reseñas Recibidas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="library-stats__details">
                                <div className="library-stats__section">
                                    <h3 className="library-stats__section-title">Géneros más Representados</h3>
                                    {stats.mostRepresentedGenres && stats.mostRepresentedGenres.length > 0 ? (
                                        <div className="library-stats__genres-list">
                                            {stats.mostRepresentedGenres.slice(0, 5).map((genre) => {
                                                const maxCount = Math.max(...stats.mostRepresentedGenres.map(g => g.count), 1);
                                                const percentage = Math.round((genre.count / maxCount) * 100);
                                                return (
                                                    <div key={genre.genreId} className="library-stats__genre-item">
                                                        <div className="library-stats__genre-info">
                                                            <span className="library-stats__genre-name">{genre.genreName}</span>
                                                            <span className="library-stats__genre-count">
                                                                {genre.count} {genre.count === 1 ? 'libro' : 'libros'}
                                                            </span>
                                                        </div>
                                                        <div className="library-stats__progress-bar-bg">
                                                            <div
                                                                className="library-stats__progress-bar-fill"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="library-stats__empty">No hay suficientes géneros registrados.</div>
                                    )}
                                </div>

                                <div className="library-stats__section">
                                    <h3 className="library-stats__section-title">Libros más Populares</h3>
                                    {stats.mostPopularBooks && stats.mostPopularBooks.length > 0 ? (
                                        <div className="library-stats__popular-list">
                                            {stats.mostPopularBooks.slice(0, 5).map((popular, index) => (
                                                <div key={popular.book.id} className="library-stats__popular-item">
                                                    <span className="library-stats__popular-rank">#{index + 1}</span>
                                                    <div className="library-stats__popular-info">
                                                        <span className="library-stats__popular-title">{popular.book.title}</span>
                                                        <span className="library-stats__popular-subtitle">
                                                            Por {popular.book.authors.join(', ')} • {popular.interactions} {popular.interactions === 1 ? 'interacción' : 'interacciones'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="library-stats__empty">No hay libros con interacciones aún.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

const MyLibrary = () => {
    const { user } = useAuth();

    // UI control states
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Book catalog states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const {
        books,
        pagination,
        isLoading,
        error: booksError,
        fetchLibraryBooks,
        clearError: clearBooksError
    } = useLibraryBooks();

    // Fetch books initially and when filters change
    useEffect(() => {
        if (user?.libraryId) {
            fetchLibraryBooks(user.libraryId, { page: currentPage - 1, size: pageSize });
        }
        // Guardar origen para el botón "Regresar" de BookDetail
        localStorage.setItem("lectuaria_back_path", PATHS.MY_LIBRARY);
    }, [user?.libraryId, currentPage, pageSize, fetchLibraryBooks]);

    // Handlers
    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1);
    }, []);

    useSEO({
        title: `Mi Biblioteca | ${SITE_INFO.name}`,
        description: `Gestiona los datos de tu biblioteca en ${SITE_INFO.name}.`,
        keywords: "mi biblioteca, gestión, biblioteca, Medellín"
    });

    return (
        <main className="myLibrary books">
            <div className="myLibrary__container books__container">
                <section className="myLibrary__header">
                    <article className="myLibrary__header__title">
                        <h1>Mi Biblioteca</h1>
                        <p>Bienvenido a la gestión de <strong>{user?.libraryName}</strong></p>
                    </article>
                    <article className="myLibrary__header__options">
                        <Button variant="outlined" onClick={() => setIsEditingInfo(!isEditingInfo)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></g></svg>
                            <span>{isEditingInfo ? "Cancelar" : "Editar datos"}</span>
                        </Button>
                        <Button variant="outlined" onClick={() => setIsBulkUploadOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m5-7l-5-5l-5 5m14 7v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg>
                            <span>Subida masiva</span>
                        </Button>
                        <Link to={PATHS.ADD_BOOK}>
                            <Button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7v14" /></svg>
                                <span>Agregar libro</span>
                            </Button>
                        </Link>
                    </article>
                </section>

                {isEditingInfo && (
                    <LibraryInfoForm
                        onCancel={() => setIsEditingInfo(false)}
                        onSuccess={() => {
                            setToast({ message: "¡Datos actualizados exitosamente!", type: "success" });
                            setIsEditingInfo(false);
                        }}
                    />
                )}

                <LibraryStatisticsDashboard />

                {/* Library Catalog Section */}
                <section className="myLibrary__books books__body" style={{ marginTop: '2rem', display: 'block' }}>
                    <h2>Catálogo de tu biblioteca</h2>
                    <br />

                    <article className="books__container__items" style={{ width: '100%', maxWidth: '100%' }}>
                        <div className="books__topbar">
                            <p className="books__count">
                                {pagination?.totalElements ?? 0} libro{pagination?.totalElements !== 1 ? "s" : ""} encontrado{pagination?.totalElements !== 1 ? "s" : ""}
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
                                {/* View toggle oculto para bibliotecarios */}
                            </div>
                        </div>

                        <div className="books__grid">
                            {isLoading && <div className="books__loading">Cargando libros...</div>}

                            {booksError && (
                                <Toast
                                    message={`Error: ${booksError}`}
                                    type="error"
                                    onClose={() => {
                                        clearBooksError();
                                        if (user?.libraryId) {
                                            fetchLibraryBooks(user.libraryId, { page: currentPage - 1, size: pageSize });
                                        }
                                    }}
                                />
                            )}

                            {!isLoading && !booksError && books.length === 0 && (
                                <p className="books__empty" style={{ gridColumn: '1 / -1' }}>
                                    No se encontraron libros en tu biblioteca.
                                </p>
                            )}

                            {!isLoading && !booksError && books.map(book => (
                                <BookCard key={book.id} book={book} viewMode="grid" />
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

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Bulk Upload Modal */}
                <BulkUploadModal 
                    isOpen={isBulkUploadOpen}
                    onClose={() => setIsBulkUploadOpen(false)}
                    onSuccess={() => {
                        if (user?.libraryId) {
                            fetchLibraryBooks(user.libraryId, { page: currentPage - 1, size: pageSize });
                        }
                    }}
                />
            </div>
        </main>
    );
};

export default MyLibrary;