import type { BookSummary } from "@/types";
import { Rating } from "@mui/material";
import "./bookCard.scss";
import Toast, { type ToastType } from "../UI/Toast";
import Modal from "../UI/Modal";
import AddToListModal from "../Modals/AddToListModal";
import EditAvailabilityModal from "../Modals/EditAvailabilityModal";
import ShareMenu from "../Modals/ShareMenu";
import FriendSelector from "../Cards/FriendSelector";
import Button from "../UI/Button";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/routes";
import { useAuth } from "@/context/AuthContext";
import { useRating } from "@/hooks/useRating";
import { useFriendship } from "@/hooks/useFriendship";
import { useFavorites } from "@/hooks/useFavorites";
import * as bookShareService from "@/services/bookShareService";

// Nota: Los estados de favorito/compartir/lista son locales para UI
// En producción, se sincronizarían con el backend vía API

interface BookCardProps {
    book: BookSummary;
    viewMode?: 'grid' | 'list';
    onRemoveFromList?: (bookId: number) => void;
    onMoveBook?: (bookId: number, bookTitle: string, currentListId: number, currentListName: string) => void;
    onHide?: (bookId: number) => Promise<void>;
    recommendationReason?: string;
}

const BookCard = ({ book, viewMode = 'grid', onRemoveFromList, onMoveBook, onHide, recommendationReason }: BookCardProps) => {
    const [shareMenuAnchor, setShareMenuAnchor] = useState<HTMLElement | null>(null);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const isMenuOpenRef = useRef(false);
    const isNavigatingRef = useRef(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [shareMessage, setShareMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { friends, loadFriends } = useFriendship();
    const [isAddListOpen, setIsAddListOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isHiding, setIsHiding] = useState(false);
    const [isEditAvailabilityOpen, setIsEditAvailabilityOpen] = useState(false);

    // Hook para manejar calificaciones
    const { userRating, averageRating, ratingsCount, isLoading, rateBook } = useRating(book.id);

    // Hook para manejar favoritos
    const { 
        checkBookIsFavorite, 
        addBookToFavorites, 
        removeBookFromFavorites
    } = useFavorites();
    
    const [isFavorite, setIsFavorite] = useState(false);

    // Cargar estado de favorito al montar el componente (solo para lectores)
    useEffect(() => {
        const loadFavoriteStatus = async () => {
            // No cargar favoritos si es bibliotecario
            if (user?.userRole === 'LIBRARIAN') {
                return;
            }
            try {
                const favoriteStatus = await checkBookIsFavorite(book.id);
                setIsFavorite(favoriteStatus);
            } catch (err) {
                console.error("Error checking favorite status:", err);
            }
        };
        
        loadFavoriteStatus();
    }, [book.id, checkBookIsFavorite, user?.userRole]);

    const handleCardClick = (e?: React.MouseEvent) => {
        if (isMenuClosing || isMenuOpenRef.current || isNavigatingRef.current) {
            e?.preventDefault();
            e?.stopPropagation();
            return;
        }
        navigate(`${PATHS.BOOKS}/${book.isbn}`);
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        // No permitir agregar favoritos si es bibliotecario
        if (user?.userRole === 'LIBRARIAN') {
            setToast({ message: "Los bibliotecarios no pueden agregar favoritos", type: "info" });
            return;
        }
        try {
            if (isFavorite) {
                await removeBookFromFavorites(book.id);
                setIsFavorite(false);
                setToast({ message: "Libro eliminado de favoritos", type: "success" });
            } else {
                await addBookToFavorites(book.id);
                setIsFavorite(true);
                setToast({ message: "Libro añadido a favoritos", type: "success" });
            }
        } catch (err: any) {
            setToast({ message: "Error al gestionar favoritos", type: "error" });
        }
    };

    const handleToggleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        isMenuOpenRef.current = true;
        setShareMenuAnchor(e.currentTarget);
    };

    const handleCloseShareMenu = () => {
        setShareMenuAnchor(null);
        setIsMenuClosing(true);
        isMenuOpenRef.current = false;
        setTimeout(() => setIsMenuClosing(false), 300);
    };

    const handleCopyLink = async () => {
        try {
            const shareLink = `${window.location.origin}/books/${book.isbn}`;
            await navigator.clipboard.writeText(shareLink);
            setToast({ message: "Enlace copiado al portapapeles", type: "success" });
        } catch (err) {
            setToast({ message: "Error al copiar el enlace", type: "error" });
        }
    };

    const handleShareWithFriends = () => {
        setIsShareModalOpen(true);
        loadFriends();
    };

    const handleShareWithFriendsStart = () => {
        setIsMenuClosing(true);
        isNavigatingRef.current = true;
    };

    const handleSendShare = async () => {
        if (!book?.id || selectedFriends.length === 0) return;
        setIsSubmitting(true);
        try {
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
            setToast({ message: "Error al compartir el libro", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToList = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAddListOpen(true);
    };

    const handleMoveBook = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onMoveBook) {
            onMoveBook(book.id, book.title, book.userAddedId || 0, "Lista actual");
        }
    };

    // Tooling states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookOwner) {
            // Si es el creador, ir a EditBook (edición completa del libro)
            navigate(`/my-library/edit-book/${book.id}`);
        } else {
            // Si no es el creador, solo puede editar la disponibilidad
            setIsEditAvailabilityOpen(true);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmRemoveFromLibrary = async () => {
        setIsDeleteModalOpen(false);
        try {
            const { removeBookFromLibrary } = await import("@/services/bookService");
            await removeBookFromLibrary(book.id);
            setToast({ message: "Libro eliminado de tu biblioteca.", type: "success" });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(err);
            setToast({ message: "Error al intentar quitar el libro.", type: "error" });
        }
    };

    const isBookOwner = Boolean(user?.id && book?.createdById != null && String(book.createdById) === String(user.id));
    const isBookAddedByUser = Boolean(user?.id && book?.userAddedId != null && String(book.userAddedId) === String(user.id));
    const isLibrarian = user?.userRole === "LIBRARIAN";

    return (
        <div
            className={`bookCard ${viewMode}${isHiding ? ' hiding' : ''}`}
            onClick={handleCardClick}
            onMouseDown={(e) => {
                if (isMenuClosing || isMenuOpenRef.current || isNavigatingRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            <div className="bookCard__header">
                <div className="bookCard__images">
                    {book.coverUrl ? (
                        <img
                            src={book.coverUrl}
                            alt={`Portada de ${book.title}`}
                            loading="lazy"
                        />
                    ) : (
                        <>
                            <img src="/images/cover/fallback-front.png" alt="Portada por defecto" />
                            <img src="/images/cover/fallback-back.png" alt="Contraportada por defecto" />
                        </>
                    )}
                </div>

                <div className="bookCard__tools">
                    {/* Botón de favoritos - SOLO PARA LECTORES */}
                    {!isLibrarian && (
                        <>
                            {onRemoveFromList && (
                                <Button
                                    layout="icon"
                                    className="bookCard__remove-list"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromList(book.id);
                                    }}
                                    aria-label="Quitar de esta lista"
                                    title="Quitar de esta lista"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 9l-6 6m0-6l6 6m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0" /></svg>
                                </Button>
                            )}
                            {onMoveBook && (
                                <Button
                                    layout="icon"
                                    className="bookCard__move"
                                    onClick={handleMoveBook}
                                    aria-label="Mover libro a otra lista"
                                    title="Mover libro a otra lista"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3L4 7l4 4M4 7h16m-4 14l4-4l-4-4m4 4H4"/></svg>
                                </Button>
                            )}
                            <Button
                                layout="icon"
                                className="bookCard__fav"
                                onClick={handleToggleFavorite}
                                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                                aria-pressed={isFavorite}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    className={isFavorite ? 'fav' : ''}
                                >
                                    <path
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676a.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                                    />
                                </svg>
                            </Button>
                        </>
                    )}

                    {/* Botón de compartir - PARA TODOS (lectores y bibliotecarios) */}
                    <Button
                        layout="icon"
                        className="bookCard__share"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleShare(e);
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                        }}
                        aria-label="Compartir libro"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <path d="m8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98" />
                            </g>
                        </svg>
                    </Button>

                    {/* Botones contextuales - SOLO PARA BIBLIOTECARIOS */}
                    {isLibrarian && (
                        <>
{/* Botón de editar - Si es el creador abre EditBook, si no solo disponibilidad */}
                            <Button
                                layout="icon"
                                className="bookCard__edit"
                                onClick={handleEditClick}
                                aria-label={isBookOwner ? "Editar libro" : "Editar disponibilidad"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" /></svg>
                            </Button>

                            {/* Botón de quitar de biblioteca - Si ha añadido el libro a su biblioteca (sea o no el creador) */}
                            {isBookAddedByUser && (
                                <Button
                                    layout="icon"
                                    className="bookCard__remove"
                                    onClick={handleDeleteClick}
                                    aria-label="Quitar de mi biblioteca"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                    >
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            )}
                        </>
                    )}

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${PATHS.BOOKS}/${book.isbn}`);
                        }}
                        className="bookCard__details"
                    >
                        <Button variant="text">
                            <span>Ver detalles</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bookCard__content">
                <h3 className="bookCard__title">{book.title}</h3>

                <p className="bookCard__authors">
                    {book.authors.slice(0, 2).join(', ')}
                    {book.authors.length > 2 && ` +${book.authors.length - 2}`}
                </p>

                <p className="bookCard__genres">
                    {book.genres.slice(0, 2).map(genre => genre.name).join(', ')}
                    {book.genres.length > 2 && ` +${book.genres.length - 2}`}
                </p>

                {user && user.userRole === 'READER' ? (
                    <div className="bookCard__add">
                        <div className="bookCard__actions-wrapper">
                            <Button
                                variant="outlined"
                                className="bookCard__add-list"
                                onClick={handleAddToList}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" /></svg>
                                Agregar a lista
                            </Button>
                            {onHide && (
                                <Button
                                    variant="outlined"
                                    className="bookCard__hide-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsHiding(true);
                                        setTimeout(async () => {
                                            try {
                                                await onHide(book.id);
                                            } catch (err) {
                                                setIsHiding(false);
                                                console.error("Error hiding recommendation:", err);
                                            }
                                        }, 400);
                                    }}
                                    aria-label="Ocultar recomendación"
                                    title="Ocultar recomendación"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242" />
                                            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143M2 2l20 20" />
                                        </g>
                                    </svg>
                                    Ocultar
                                </Button>
                            )}
                        </div>
                    </div>
                ) :
                    null
                }

                {recommendationReason && (
                    <p className="bookCard__reason">💡 {recommendationReason}</p>
                )}

                <div className="bookCard__stars">
                    {user && user.userRole === 'READER' ? (
                        <>
                            {/* Estrellas interactivas para usuarios lectores */}
                            <Rating
                                name={`user-rating-${book.id}`}
                                value={userRating || averageRating || book.averageRating}
                                precision={0.5}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(_, newValue) => {
                                    if (newValue && newValue > 0) {
                                        rateBook(newValue);
                                    }
                                }}
                                disabled={isLoading}
                                size="small"
                            />
                        </>
                    ) : (
                        // Estrellas de solo lectura para bibliotecarios o usuarios no logueados
                        <Rating
                            name={`rating-${book.id}`}
                            value={averageRating || book.averageRating}
                            precision={0.5}
                            readOnly
                            size="small"
                        />
                    )}
                    <span className="bookCard__count">
                        {`(${ratingsCount || book.ratingsCount})`}
                    </span>
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmRemoveFromLibrary}
                title="Quitar de mi biblioteca"
                message={`¿Estás seguro de que deseas quitar "${book.title}" de tu biblioteca? \nSi eres el creador, perderás los permisos de edición sobre él permanentemente.`}
                confirmText="Sí, quitar"
                cancelText="Mantener"
            />

            {/* Modal para agregar a lista */}
            <AddToListModal
                isOpen={isAddListOpen}
                onClose={() => setIsAddListOpen(false)}
                bookId={book.id}
                bookTitle={book.title}
            />

            {/* Modal para mover libro */}
            {isMoveModalOpen && createPortal(
                <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setIsMoveModalOpen(false); }}>
                    <div className="modal-content move-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Mover libro</h2>
                            <button className="close-btn" onClick={() => setIsMoveModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Deseas mover "{book.title}" a otra lista?</p>
                            <Button onClick={() => {
                                if (onMoveBook && book.userAddedId) {
                                    onMoveBook(book.id, book.title, book.userAddedId, "Lista actual");
                                }
                                setIsMoveModalOpen(false);
                            }}>
                                Mover a otra lista
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal para compartir con amigos */}
            {isShareModalOpen && createPortal(
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
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
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
                </div>,
                document.body
            )}

            {/* Share Menu */}
            <ShareMenu
                anchorEl={shareMenuAnchor}
                onClose={handleCloseShareMenu}
                onShareWithFriends={handleShareWithFriends}
                onShareWithFriendsStart={handleShareWithFriendsStart}
                onCopyLink={handleCopyLink}
            />

            {/* Toast para Feedback */}
            {toast && createPortal(
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />,
                document.body
            )}

            {/* Modal para editar disponibilidad del libro en la biblioteca del bibliotecario */}
            <EditAvailabilityModal
                isOpen={isEditAvailabilityOpen}
                onClose={() => setIsEditAvailabilityOpen(false)}
                bookId={book.id}
                bookTitle={book.title}
                onSuccess={() => {
                    setToast({ message: "Disponibilidad actualizada correctamente.", type: "success" });
                }}
            />
        </div>
    );
}

export default BookCard;