import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./listDetail.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";
import { getListDetails, removeBookFromList } from "@/services/listService";
import type { UserListDTO } from "@/types";
import BookCard from "@/components/Cards/BookCard";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import ShareMenu from "@/components/Modals/ShareMenu";
import MoveBookModal from "@/components/Modals/MoveBookModal";
import { useUserLists } from "@/hooks/useUserLists";
import { Chip } from "@mui/material";
import { createPublicShareLink } from "@/services/listShareService";
import { useAuth } from "@/context/AuthContext";
import { useFriendship } from "@/hooks/useFriendship";
import FriendSelector from "@/components/Cards/FriendSelector";
import * as listShareService from "@/services/listShareService";

const ListDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [list, setList] = useState<UserListDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { deleteList } = useUserLists({ autoFetch: false });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareMenuAnchor, setShareMenuAnchor] = useState<HTMLElement | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [bookToMove, setBookToMove] = useState<{ id: number; title: string } | null>(null);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [shareMessage, setShareMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { friends, loadFriends } = useFriendship();

    // Verificar si el usuario actual es el dueño de la lista
    const isOwner = list && user ? list.userId === user.id : false;

    const fetchListDetails = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await getListDetails(Number(id));
            setList(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Error al cargar la lista");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchListDetails();
    }, [fetchListDetails]);

    const handleDelete = async () => {
        if (!list) return;
        try {
            await deleteList(list.id);
            navigate("/lists");
        } catch (err) {
            setDeleteError("No se pudo eliminar la lista");
            setIsDeleteModalOpen(false);
        }
    };

    const handleRemoveBook = async (bookId: number) => {
        if (!list) return;
        try {
            await removeBookFromList(list.id, bookId);
            fetchListDetails();
        } catch (err) {
            setError("No se pudo quitar el libro de la lista");
        }
    };

    const handleToggleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
        setShareMenuAnchor(event.currentTarget);
    };

    const handleCloseShareMenu = () => {
        setShareMenuAnchor(null);
    };

    const handleShareWithFriends = () => {
        handleCloseShareMenu();
        loadFriends();
        setIsShareModalOpen(true);
    };

    const handleSendShare = async () => {
        if (!list?.id || selectedFriends.length === 0) return;
        setIsSubmitting(true);
        try {
            const result = await listShareService.shareListWithFriends(list.id, {
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
            setToast({ message: "Error al compartir la lista", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMoveBook = (bookId: number, bookTitle: string) => {
        if (!list) return;
        setBookToMove({ id: bookId, title: bookTitle });
        setIsMoveModalOpen(true);
    };

    const handleCopyLink = async () => {
        if (!list) return;
        try {
            const link = await createPublicShareLink(list.id);
            const fullUrl = `${window.location.origin}/shared/${link.publicToken}`;
            await navigator.clipboard.writeText(fullUrl);
        } catch (err: any) {
            const errorMessage = err?.message || "Error al crear enlace de compartición";
            setToast({ message: errorMessage, type: "error" });
        }
        handleCloseShareMenu();
    };

    useSEO({
        title: list ? `${list.name} | ${SITE_INFO.name}` : `Lista | ${SITE_INFO.name}`,
        description: list ? `Consulta los libros de la lista "${list.name}" en ${SITE_INFO.name}.` : `Consulta los libros de tu lista seleccionada en ${SITE_INFO.name}.`,
        keywords: "lista de libros, mi colección, lectura, Medellín"
    });

    if (isLoading) return <div className="list__loading">Cargando lista...</div>;
    if (error || !list) return <div className="list__error">{error || "Lista no encontrada"}</div>;

    return (
        <main className="listDetail">
            <div className="listDetail__container">
                <section className="listDetail__header">
                    <div className="listDetail__header-left">
                        <Button variant="text" onClick={() => navigate("/lists")} className="listDetail__back-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7l7-7" /></svg>
                            Volver a mis listas
                        </Button>
                        <div className="listDetail__title-group">
                            <h1>{list.name}</h1>
                            <div className="listDetail__badges">
                                <Chip
                                    label={list.listType === 'SYSTEM' ? 'Sistema' : 'Personal'}
                                    size="small"
                                    color={list.listType === 'SYSTEM' ? 'primary' : 'secondary'}
                                    variant="outlined"
                                />
                                {list.visibility === 'PRIVATE' && (
                                    <Chip label="Privada" size="small" variant="outlined" />
                                )}
                                {list.visibility === 'PUBLIC' && (
                                    <Chip label="Pública" size="small" variant="outlined" color="primary" />
                                )}
                                {list.visibility === 'LISTED' && (
                                    <Chip label="Listada" size="small" variant="outlined" />
                                )}
                                <span className="list__count">{(list.books || []).length} libros</span>
                            </div>
                            {list.description && (
                                <p className="listDetail__description">{list.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="listDetail__header-right">
                        {isOwner && (
                            <>
                                <Button variant="outlined" className="list__share-btn" onClick={handleToggleShare}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98" /><path d="M15.41 6.51l-6.82 3.98" /></g></svg>
                                    Compartir
                                </Button>
                                <ShareMenu
                                    anchorEl={shareMenuAnchor}
                                    onClose={handleCloseShareMenu}
                                    onShareWithFriends={handleShareWithFriends}
                                    onCopyLink={handleCopyLink}
                                />
                                {list.listType === 'CUSTOM' && (
                                    <Button variant="outlined" className="list__delete-btn" onClick={() => setIsDeleteModalOpen(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" /></svg>
                                        Eliminar lista
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <section className="listDetail__books">
                    {deleteError && (
                        <div className="listDetail__error-message" role="alert">
                            {deleteError}
                            <Button variant="text" onClick={() => setDeleteError(null)} className="listDetail__error-close">✕</Button>
                        </div>
                    )}
                    {(list.books || []).length > 0 ? (
                        <div className="listDetail__grid">
                            {(list.books || []).map(book => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    onRemoveFromList={handleRemoveBook} 
                                    onMoveBook={handleMoveBook}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="listDetail__empty">
                            <p>Esta lista está vacía.</p>
                            <Button onClick={() => navigate("/books")}>Explorar libros para agregar</Button>
                        </div>
                    )}
                </section>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar lista"
                message={`¿Estás seguro de que deseas eliminar la lista "${list.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar permanentemente"
                cancelText="Cancelar"
            />
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
                </div>
            )}
            <MoveBookModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                onMoveComplete={() => fetchListDetails()}
                bookId={bookToMove?.id || 0}
                bookTitle={bookToMove?.title || ""}
                currentListId={list.id}
                currentListName={list.name}
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
};

export default ListDetail;