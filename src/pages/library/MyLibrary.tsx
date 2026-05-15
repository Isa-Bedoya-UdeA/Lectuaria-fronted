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
import "./myLibrary.scss";
// Mismos estilos que el catálogo
import "@/pages/books/books.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";

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