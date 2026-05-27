import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Chip } from "@mui/material";
import "./listCard.scss";
import Toast, { type ToastType } from "../UI/Toast";
import { useFriendship } from "@/hooks/useFriendship";
import ShareMenu from "../Modals/ShareMenu";
import FriendSelector from "../Cards/FriendSelector";
import Button from "../UI/Button";
import { createPublicShareLink } from "@/services/listShareService";
import * as listShareService from "@/services/listShareService";
import type { UserListDTO } from "@/types";

interface ListCardProps {
    list: UserListDTO;
    onDelete: (listId: number) => void;
}

const ListCard = ({ list, onDelete }: ListCardProps) => {
    const [shareMenuAnchor, setShareMenuAnchor] = useState<{ listId: number; anchor: HTMLElement | null }>({ listId: 0, anchor: null });
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const isMenuOpenRef = useRef(false);
    const isNavigatingRef = useRef(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [shareMessage, setShareMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { friends, loadFriends } = useFriendship();

    const handleToggleShare = (e: React.MouseEvent<HTMLButtonElement>, listId: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        isMenuOpenRef.current = true;
        setShareMenuAnchor({ listId, anchor: e.currentTarget });
    };

    const handleCloseShareMenu = () => {
        setShareMenuAnchor({ listId: 0, anchor: null });
        setIsMenuClosing(true);
        isMenuOpenRef.current = false;
        setTimeout(() => setIsMenuClosing(false), 300);
    };

    const handleCopyLink = async () => {
        const { listId } = shareMenuAnchor;
        if (!listId) return;
        try {
            const link = await createPublicShareLink(listId);
            const fullUrl = `${window.location.origin}/shared/${link.publicToken}`;
            await navigator.clipboard.writeText(fullUrl);
        } catch (err: any) {
            const errorMessage = err?.message || "Error al crear enlace de compartición";
            setToast({ message: errorMessage, type: "error" });
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
                const errorMessage = result.errorMessages.join(". ");
                setToast({ message: errorMessage || result.message, type: "error" });
            } else {
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

    return (
        <>
            <Link
                to={`/lists/${list.id}`}
                className={`list-card ${isMenuOpenRef.current || isMenuClosing || isNavigatingRef.current ? 'list-card--disabled' : ''}`}
                onClick={(e) => {
                    if (isMenuClosing || isMenuOpenRef.current || isNavigatingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                onMouseDown={(e) => {
                    if (isMenuClosing || isMenuOpenRef.current || isNavigatingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <div className="list-card__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                </div>
                <div className="list-card__content">
                    <div className="list-card__header">
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
                    </div>
                    <h3>{list.name}</h3>
                    {list.description && <p className="list-card__description">{list.description}</p>}
                    <p className="list-card__count">{list.bookCount} {list.bookCount === 1 ? 'libro' : 'libros'}</p>
                </div>
                <div className="list-card__footer">
                    <span className="list-card__link">Ver lista</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7l-7 7" /></svg>
                    {list.listType !== 'SYSTEM' && (
                        <>
                            <button
                                className="list-card__share"
                                onClick={(e) => handleToggleShare(e, list.id)}
                                aria-label="Compartir lista"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98" /><path d="M15.41 6.51l-6.82 3.98" /></g></svg>
                            </button>
                            <button
                                className="list-card__delete"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(list.id);
                                }}
                                aria-label="Eliminar lista"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </Link>

            <ShareMenu
                anchorEl={shareMenuAnchor.anchor}
                onClose={handleCloseShareMenu}
                onShareWithFriends={handleShareWithFriends}
                onShareWithFriendsStart={handleShareWithFriendsStart}
                onCopyLink={handleCopyLink}
            />

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

            {toast && createPortal(
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />,
                document.body
            )}
        </>
    );
};

export default ListCard;
