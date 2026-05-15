import "./bookDetail.scss";
import { Rating, Chip } from "@mui/material";
import Button from "@/components/UI/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useBookDetail } from "@/hooks/useBookDetail";
import { useRating } from "@/hooks/useRating";
import { useReviews } from "@/hooks/useReviews";
import { useFavorites } from "@/hooks/useFavorites";
import { useFriendship } from "@/hooks/useFriendship";
import { useSimilarBooks } from "@/hooks/useSimilarBooks";
import { useState, useEffect } from "react";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "@/context/AuthContext";
import ReviewCard from "@/components/Cards/ReviewCard";
import Modal from "@/components/UI/Modal";
import AddToListModal from "@/components/Modals/AddToListModal";
import ShareMenu from "@/components/Modals/ShareMenu";
import FriendSelector from "@/components/Cards/FriendSelector";
import LibraryCard from "@/components/Cards/LibraryCard";
import BookCard from "@/components/Cards/BookCard";
import { type Review } from "@/types";
import { ratingService } from "@/services/ratingService";
import * as bookShareService from "@/services/bookShareService";
import Toast, { type ToastType } from "@/components/UI/Toast";

const BookDetail = () => {
    const navigate = useNavigate();
    const { isbn } = useParams<{ isbn: string }>();
    const { user } = useAuth();
    const {
        book,
        isLoading,
        error,
        fetchBook,
        clearError
    } = useBookDetail();

    // Hook para manejar calificaciones
    const {
        userRating,
        averageRating,
        ratingsCount,
        isLoading: ratingLoading,
        rateBook,
        loadUserRating,
        reviewId,
        reviewText: hookReviewText,
        reviewStatus
    } = useRating(book?.id || 0);

    // Hook para manejar reseñas
    const {
        reviews,
        isLoading: reviewsLoading,
        fetchReviews,
        addReview,
        updateReview: modifyReview,
        deleteReview: removeReview
    } = useReviews();

    // Hook para manejar favoritos
    const {
        checkBookIsFavorite,
        addBookToFavorites,
        removeBookFromFavorites
    } = useFavorites();

    const [isFavorite, setIsFavorite] = useState(false);

    // Cargar estado de favoritos cuando se carga el libro
    useEffect(() => {
        const loadFavoriteStatus = async () => {
            try {
                const favoriteStatus = await checkBookIsFavorite(book?.id || 0);
                setIsFavorite(favoriteStatus);
            } catch (err) {
                console.error("Error checking favorite status:", err);
            }
        };

        loadFavoriteStatus();
    }, [book?.id, checkBookIsFavorite]);
    const [isAddListOpen, setIsAddListOpen] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempRating, setTempRating] = useState<number>(0); // Estado local para la selección temporal de estrellas
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [shareMenuAnchor, setShareMenuAnchor] = useState<HTMLElement | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [shareMessage, setShareMessage] = useState("");

    const { friends, loadFriends } = useFriendship();

    const { 
        books: similarBooks,
        fetchSimilarBooks 
    } = useSimilarBooks();

    // Cargar el libro y las reseñas cuando cambie el ISBN
    useEffect(() => {
        if (isbn) {
            const bookIsbn = parseInt(isbn, 10);
            if (!isNaN(bookIsbn)) {
                fetchBook(bookIsbn);
            }
        }
    }, [isbn, fetchBook]);

    // Cargar reseñas cuando se carga el libro
    useEffect(() => {
        if (book?.id) {
            fetchReviews(book.id);
            fetchSimilarBooks(book.id);
        }
    }, [book?.id, fetchReviews, fetchSimilarBooks]);

    // Inicializar tempRating y reviewText con la calificación actual del usuario
    useEffect(() => {
        if (userRating > 0) {
            setTempRating(userRating);
        }
        if (hookReviewText) {
            setReviewText(hookReviewText);
        }
    }, [userRating, hookReviewText]);

    // Resetear tempRating cuando se carga un nuevo libro
    useEffect(() => {
        setTempRating(0);
    }, [isbn]);

    // Cargar amigos cuando el usuario está autenticado
    useEffect(() => {
        if (user && user.userRole === "READER") {
            loadFriends();
        }
    }, [user, loadFriends]);

    // SEO dinámico
    useSEO({
        title: book ? `${book.title} | ${SITE_INFO.name}` : `Cargando... | ${SITE_INFO.name}`,
        description: book
            ? `Lee reseñas, califica y conoce todos los detalles de ${book.title} por ${book.authors.join(', ')} en ${SITE_INFO.name}.`
            : "",
        keywords: book
            ? `libro, ${book.title}, ${book.authors.join(', ')}, ${book.genres.map(g => g.name).join(', ')}, ${SITE_INFO.name}, reseñas de libros`
            : ""
    });

    // Handlers
    // Handlers
    const backPath = localStorage.getItem("lectuaria_back_path") || "/books";
    const isFromLibrary = backPath.includes("my-library");
    const backText = isFromLibrary ? "Volver a Mi biblioteca" : "Volver al catálogo";

    const handleGoBack = () => {
        navigate(backPath);
    };

    const handleToggleFavorite = async () => {
        if (!book?.id || !user) return;

        try {
            if (isFavorite) {
                await removeBookFromFavorites(book.id);
                setToast({ message: "Eliminado de favoritos", type: "success" });
            } else {
                await addBookToFavorites(book.id);
                setToast({ message: "Añadido a favoritos", type: "success" });
            }
            setIsFavorite(!isFavorite);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar favoritos";
            setToast({ message: errorMessage, type: "error" });
        }
    };

    const handleToggleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
        setShareMenuAnchor(event.currentTarget);
    };

    const handleCloseShareMenu = () => {
        setShareMenuAnchor(null);
    };

    const handleShareWithFriends = () => {
        setIsShareModalOpen(true);
    };

    const handleCopyLink = async () => {
        if (!book?.isbn) return;
        try {
            const shareLink = `${window.location.origin}/books/${book.isbn}`;
            await navigator.clipboard.writeText(shareLink);
            setToast({ message: "Enlace copiado al portapapeles", type: "success" });
        } catch (err) {
            setToast({ message: "Error al copiar el enlace", type: "error" });
        }
    };

    const handleSendShare = async () => {
        if (!book?.id || selectedFriends.length === 0) return;
        setIsSubmitting(true);
        try {
            // Verificar si el libro ya está compartido con alguno de los amigos seleccionados
            const alreadySharedWith: number[] = [];
            for (const friendId of selectedFriends) {
                const isShared = await bookShareService.isBookSharedWithFriend(book.id, friendId);
                if (isShared) {
                    alreadySharedWith.push(friendId);
                }
            }

            const result = await bookShareService.shareBookWithFriends(book.id, {
                friendIds: selectedFriends,
                message: shareMessage
            });

            if (result.failedShares === 0) {
                setToast({ message: result.message, type: "success" });
                setIsShareModalOpen(false);
                setSelectedFriends([]);
                setShareMessage("");
            } else if (result.successfulShares === 0) {
                // Todos fallaron
                const errorMessage = result.errorMessages.join(". ");
                setToast({ message: errorMessage || result.message, type: "error" });
            } else {
                // Algunos fallaron, otros fueron exitosos
                const errorMessage = result.errorMessages.join(". ");
                setToast({
                    message: `${result.message}. Errores: ${errorMessage}`,
                    type: "warning"
                });
                setIsShareModalOpen(false);
                setSelectedFriends([]);
                setShareMessage("");
            }
        } catch (err: any) {
            if (err.response?.status === 409) {
                setToast({ message: err.response?.data?.message || "Este libro ya ha sido compartido con este usuario", type: "error" });
            } else {
                setToast({ message: "Error al compartir el libro", type: "error" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenListModal = () => setIsAddListOpen(true);

    const handleOpenAvailabilityModal = () => setIsAvailabilityModalOpen(true);

    const handleEditReview = (review: Review) => {
        setIsEditing(true);
        setEditingReview(review);
        setTempRating(review.rating);
        setReviewText(review.reviewText || "");
    };

    const handleDeleteReview = (reviewId: string) => {
        setReviewToDelete(reviewId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsSubmitting(true);
        try {
            if (reviewToDelete === "0") {
                // Si el ID es "0", es una calificación de solo estrellas
                await ratingService.deleteRating(book?.id || 0);
            } else {
                // Si tiene un ID real, es una reseña escrita (que ahora en el backend borra ambas cosas)
                await removeReview(reviewToDelete);
            }
            setToast({ message: "Interacción eliminada correctamente", type: "success" });
            setDeleteModalOpen(false);
            setReviewToDelete(null);
            fetchBook(parseInt(isbn || "0", 10)); // Recargar el libro para actualizar el promedio de estrellas
            fetchReviews(book?.id || 0); // Recargar la lista de reseñas
            loadUserRating(); // Recargar el promedio de estrellas del hook useRating
        } catch (error) {
            setToast({ message: "Error al eliminar la reseña", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setReviewToDelete(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingReview(null);
        setTempRating(0);
        setReviewText("");
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        // Si no hay texto de reseña, solo queremos actualizar la calificación de estrellas
        if (reviewText.trim() === "" && tempRating !== 0) {
            setIsSubmitting(true);
            try {
                await rateBook(tempRating);
                setToast({ message: "Calificación guardada correctamente", type: "success" });
                setTempRating(0);
                setReviewText("");
                setIsEditing(false);
                setEditingReview(null);
                fetchReviews(book?.id || 0);
                fetchBook(parseInt(isbn || "0", 10));
                loadUserRating();
            } catch (error) {
                setToast({ message: "Error al guardar la calificación", type: "error" });
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Si hay texto de reseña (o es edición), usamos la funcionalidad de reseñas
        if (tempRating === 0) {
            setToast({ message: "Debes seleccionar al menos una estrella para calificar", type: "error" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Si el ID es "0" o null, significa que tenemos una calificación de estrellas pero no una reseña guardada,
            // por lo que debemos usar POST (addReview) en lugar de PUT (modifyReview)
            const isActualReview = isEditing && editingReview && editingReview.id !== "0" && editingReview.id !== null;

            if (isActualReview) {
                await modifyReview(editingReview.id.toString(), {
                    rating: tempRating,
                    reviewText: reviewText,
                    publish: true
                });
                setToast({ message: "Reseña actualizada correctamente", type: "success" });
            } else {
                await addReview(book?.id || 0, {
                    rating: tempRating,
                    reviewText: reviewText,
                    publish: true
                });
                setToast({ message: "Reseña publicada correctamente", type: "success" });
            }

            // Resetear estados comunes de edición/formulario
            setIsEditing(false);
            setEditingReview(null);
            setTempRating(0);
            setReviewText("");

            // Recargar datos después de resetear el estado de edición
            await Promise.all([
                fetchReviews(book?.id || 0),
                fetchBook(parseInt(isbn || "0", 10)),
                loadUserRating() // Recargar rating del usuario para actualizar las condiciones
            ]);

            // No need for timeouts or reload, React state handles this

        } catch (error) {
            setToast({ message: "Error al guardar la reseña", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <main className="bookDetail">
                <div className="bookDetail__container">
                    <div className="bookDetail__loading">Cargando libro...</div>
                </div>
            </main>
        );
    }

    // Error state
    if (error) {
        return (
            <main className="bookDetail">
                <div className="bookDetail__container">
                    <div className="bookDetail__error" role="alert">
                        <p>Error: {error}</p>
                        <Button onClick={() => {
                            clearError();
                            if (book?.id) fetchBook(book.id);
                        }}>
                            Reintentar
                        </Button>
                        <Button variant="text" onClick={handleGoBack}>
                            {backText}
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    // Not found state
    if (!book) {
        return (
            <main className="bookDetail">
                <div className="bookDetail__container">
                    <div className="bookDetail__not-found">
                        <p>Libro no encontrado</p>
                        <Button onClick={handleGoBack}>{backText}</Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bookDetail">
            <div className="bookDetail__container">
                <section className="bookDetail__goBack">
                    <Button variant="text" onClick={handleGoBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7-7l-7 7l7 7" /></svg>
                        <span>{backText}</span>
                    </Button>
                </section>

                <section className="bookDetail__book">
                    <aside className="bookDetail__book__cover">
                        <img
                            src={book.coverUrl || "/images/cover/fallback-front.png"}
                            alt={`Portada de ${book.title}`}
                            loading="lazy"
                        />
                        <Button onClick={handleOpenAvailabilityModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" /><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
                            <span>Ver disponibilidad en bibliotecas</span>
                        </Button>
                        <div className="bookDetail__book__tools">
                            {user && user.userRole === 'READER' && (
                                <Button
                                    variant="outlined"
                                    onClick={handleToggleFavorite}
                                    className={isFavorite ? 'active' : ''}
                                    aria-pressed={isFavorite}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676a.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>
                                    <span>Favorito</span>
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={handleToggleShare}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98" /></g></svg>
                                <span>Compartir</span>
                            </Button>
                            <ShareMenu
                                anchorEl={shareMenuAnchor}
                                onClose={handleCloseShareMenu}
                                onShareWithFriends={handleShareWithFriends}
                                onCopyLink={handleCopyLink}
                            />
                        </div>
                        {user?.userRole === 'READER' && (
                            <Button
                                variant="outlined"
                                onClick={handleOpenListModal}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7v14" /></svg>
                                <span>Añadir a lista</span>
                            </Button>
                        )}
                    </aside>

                    <article className="bookDetail__book__content">
                        <div className="bookDetail__content__header">
                            <div className="bookDetails__genres">
                                {book.genres.map(genre => (
                                    <Chip
                                        key={genre.id}
                                        label={genre.name}
                                        size="small"
                                        variant="outlined"
                                        title={genre.description}
                                    />
                                ))}
                            </div>

                            <h1 className="bookDetails__title">{book.title}</h1>

                            <h2 className="bookDetails__authors">
                                {book.authors.join(', ')}
                            </h2>

                            <div className="bookDetails__stars">
                                <Rating
                                    name="read-only"
                                    value={averageRating || book.averageRating}
                                    precision={0.5}
                                    readOnly
                                />
                                <span className="bookDetails__rating">
                                    {(averageRating || book.averageRating)?.toFixed(1)}
                                </span>
                                <span className="bookDetails__count">
                                    {`(${ratingsCount || book.ratingsCount})`}
                                </span>
                            </div>

                            <p className="bookDetail__description">{book.description}</p>

                            <div className="bookDetail__details">
                                <div className="bookDetail__details__item">
                                    <span className="bookDetail__details__item__label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M10 12h4m-4-4h4m0 13v-3a2 2 0 0 0-4 0v3" /><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" /><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /></g></svg>
                                        Editorial
                                    </span>
                                    <span className="bookDetail__details__item__value">
                                        {book.publishers.join(', ')}
                                    </span>
                                </div>

                                <div className="bookDetail__details__item">
                                    <span className="bookDetail__details__item__label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M8 2v4m8-4v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></g></svg>
                                        Fecha de publicación
                                    </span>
                                    <span className="bookDetail__details__item__value">
                                        {book.publicationDate
                                            ? new Date(book.publicationDate).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "Fecha desconocida"
                                        }
                                    </span>
                                </div>

                                <div className="bookDetail__details__item">
                                    <span className="bookDetail__details__item__label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                                        Páginas
                                    </span>
                                    <span className="bookDetail__details__item__value">
                                        {book.pages?.toLocaleString('es-CO') || "N/A"}
                                    </span>
                                </div>

                                <div className="bookDetail__details__item">
                                    <span className="bookDetail__details__item__label">ISBN</span>
                                    <span className="bookDetail__details__item__value">
                                        {book.isbn || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bookDetail__reviews">
                            <h2>Reseñas</h2>

                            {user && user.userRole === 'READER' && (
                                <>
                                    {isEditing ? (
                                        // Si está en modo edición, mostrar formulario precargado
                                        <form className="bookDetail__myReview" onSubmit={handleSubmitReview}>
                                            <p>Editar tu calificación</p>
                                            <Rating
                                                name="user-rating"
                                                value={tempRating}
                                                precision={0.5}
                                                onChange={(_event, newValue) => {
                                                    setTempRating(newValue || 0);
                                                }}
                                            />
                                            <textarea
                                                name="review"
                                                id="review"
                                                placeholder="Escribe tu reseña..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                rows={4}
                                                maxLength={2000}
                                            />
                                            <div className="bookDetail__editActions">
                                                <Button type="submit" disabled={tempRating === 0 || isSubmitting || ratingLoading}>
                                                    {isSubmitting ? "Actualizando..." : "Actualizar reseña"}
                                                </Button>
                                                <Button variant="outlined" type="button" onClick={handleCancelEdit} disabled={isSubmitting}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </form>
                                    ) : userRating > 0 && hookReviewText ? (
                                        // Si tiene calificación y texto de reseña, no mostrar formulario (se mostrará en su propia tarjeta abajo)
                                        null
                                    ) : userRating === 0 ? (
                                        // Si no tiene calificación, mostrar formulario para nueva review
                                        <form className="bookDetail__myReview" onSubmit={handleSubmitReview}>
                                            <p>Tu calificación</p>
                                            <Rating
                                                name="user-rating"
                                                value={tempRating}
                                                precision={0.5}
                                                onChange={(_event, newValue) => {
                                                    setTempRating(newValue || 0);
                                                }}
                                            />
                                            <textarea
                                                name="review"
                                                id="review"
                                                placeholder="Escribe tu reseña..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                rows={4}
                                                maxLength={2000}
                                            />
                                            <div className="bookDetail__editActions">
                                                <Button type="submit" disabled={tempRating === 0 || isSubmitting || ratingLoading}>
                                                    {isSubmitting ? "Publicando..." : "Publicar reseña"}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : null
                                    }
                                </>
                            )}
                            {user ? (
                                <div className="bookDetail__loginPrompt">
                                    <p>Los bibliotecarios no pueden calificar libros. Solo los usuarios lectores pueden dejar calificaciones.</p>
                                </div>
                            ) : (
                                <div className="bookDetail__loginPrompt">
                                    <p>Debes iniciar sesión como lector para poder calificar y reseñar este libro.</p>
                                    <Button onClick={() => navigate('/signin')}>
                                        Iniciar sesión
                                    </Button>
                                </div>
                            )}

                            <div className="bookDetails__otherReviews">
                                {reviewsLoading ? (
                                    <p>Cargando reseñas...</p>
                                ) : (
                                    <>
                                        {/* Mostrar la review del usuario actual primero si existe */}
                                        {user && !isEditing && (() => {
                                            const hasExistingRating = userRating > 0;
                                            const userReview = hasExistingRating ? {
                                                id: String(reviewId || 0),
                                                userId: user.id || 0,
                                                userName: "Tú",
                                                rating: userRating,
                                                reviewText: hookReviewText || "",
                                                reviewStatus: (reviewStatus as any) || "published",
                                                createdAt: new Date().toISOString(),
                                                isOwnReview: true
                                            } : null;

                                            return userReview ? (
                                                <div className="bookDetails__userReview">
                                                    <h3>Tu reseña</h3>
                                                    <ReviewCard
                                                        key={userReview.id}
                                                        review={userReview as any}
                                                        isOwnReview={true}
                                                        onEdit={handleEditReview}
                                                        onDelete={() => handleDeleteReview(userReview.id.toString())}
                                                    />
                                                </div>
                                            ) : null;
                                        })()}

                                        {/* Separador si hay review del usuario y otras reviews */}
                                        {(() => {
                                            const hasUserReviewVisible = user && !isEditing && userRating > 0;
                                            const hasOtherReviews = reviews.some(review => (!user || (review.userId !== user.id && !review.isOwnReview)));

                                            if (hasUserReviewVisible && hasOtherReviews) {
                                                return <hr className="bookDetails__reviewSeparator" />;
                                            }
                                            return null;
                                        })()}

                                        {/* Mostrar resto de reviews excluyendo la del usuario actual */}
                                        {reviews.length > 0 ? (
                                            reviews
                                                .filter(review => {
                                                    // Filtrar si es mi propia reseña (evitar duplicados)
                                                    if (!user) return true;

                                                    // Comparar IDs convirtiendo ambos a String para evitar problemas de tipos
                                                    const reviewAuthorId = String(review.userId);
                                                    const currentUserId = String(user.id);
                                                    const isMe = reviewAuthorId === currentUserId;

                                                    return !isMe && !review.isOwnReview;
                                                })
                                                .map((review) => (
                                                    <ReviewCard key={review.id} review={review} />
                                                ))
                                        ) : (
                                            /* Mostrar mensaje de 'No hay reseñas' solo si el usuario actual tampoco tiene una */
                                            (!user || userRating === 0) && (
                                                <p className="bookDetail__noReviews">
                                                    {book?.ratingsCount && book.ratingsCount > 0
                                                        ? "Todavía no hay reseñas escritas para este libro, ¡pero ya tiene calificaciones!"
                                                        : "Sé el primero en escribir una reseña para este libro."}
                                                </p>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </article>
                </section>

                {/* Libros Similares */}
                {similarBooks && similarBooks.length > 0 && (
                    <section className="bookDetail__similar">
                        <h2>Libros Similares</h2>
                        <div className="bookDetail__similar-carousel">
                            {similarBooks.map((similarBook) => (
                                <div className="bookDetail__similar-item" key={similarBook.id}>
                                    <BookCard book={similarBook} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Modal de confirmación para eliminar review */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Eliminar reseña"
                message="¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
            {book && (
                <AddToListModal
                    isOpen={isAddListOpen}
                    onClose={() => setIsAddListOpen(false)}
                    bookId={book.id}
                    bookTitle={book.title}
                />
            )}

            {isAvailabilityModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAvailabilityModalOpen(false)}>
                    <div className="modal-content availability-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Disponibilidad en Bibliotecas</h2>
                            <button className="close-btn" onClick={() => setIsAvailabilityModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                            </button>
                        </div>
                        <div className="availability-grid">
                            {book.availability && book.availability.length > 0 ? (
                                book.availability.map((av, index) => (
                                    <LibraryCard key={index} availability={av} />
                                ))
                            ) : (
                                <p className="no-availability">Este libro no está disponible actualmente en ninguna biblioteca del sistema.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isShareModalOpen && (
                <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(false); }}>
                    <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Compartir con amigos</h2>
                            <button className="close-btn" onClick={() => setIsShareModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <FriendSelector
                                friends={friends}
                                selectedFriends={selectedFriends}
                                onSelectionChange={setSelectedFriends}
                            />
                            <div className="share-message">
                                <label>Mensaje (opcional)</label>
                                <textarea
                                    value={shareMessage}
                                    onChange={(e) => setShareMessage(e.target.value)}
                                    placeholder="Añade un mensaje personalizado..."
                                    maxLength={500}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="outlined" onClick={() => setIsShareModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSendShare}
                                disabled={selectedFriends.length === 0 || isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Compartir"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default BookDetail;
