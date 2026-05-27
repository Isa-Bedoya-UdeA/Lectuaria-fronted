import { useState } from "react";
import { Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import { Link } from "react-router-dom";
import "./friendCard.scss";
import Modal from "../UI/Modal";
import type { UserSearchResponseDTO } from "../../types";

interface FriendCardProps {
    user: UserSearchResponseDTO;
    onAdd?: (id: number) => void;
    onRemove?: (id: number) => void;
    onAccept?: (reqId: number) => void;
    onReject?: (reqId: number) => void;
    onCancel?: (reqId: number) => void;
}

type ModalConfig = {
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
};

const FriendCard = ({ user, onAdd, onRemove, onAccept, onReject, onCancel }: FriendCardProps) => {
    const [modal, setModal] = useState<ModalConfig | null>(null);

    const getInitials = (name: string) =>
        name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

    const openModal = (config: ModalConfig) => setModal(config);
    const closeModal = () => setModal(null);

    if (user.friendshipStatus === "self") return null;

    return (
        <>
            <div className={`friendCard ${user.friendshipStatus}`}>
                <div className="friendCard__info">
                    <Avatar
                        sx={{ bgcolor: cyan[500], width: 38, height: 38 }}
                        alt={user.fullName || "User Avatar"}
                        src={user.photoUrl || undefined}
                    >
                        {getInitials(user.fullName)}
                    </Avatar>
                    <div>
                        <p>{user.fullName}</p>
                        <small>
                            {user.username ? (
                                <Link to={`/users/${user.username}`} className="friendCard__username">
                                    @{user.username}
                                </Link>
                            ) : (user.city || "")}
                        </small>
                    </div>
                </div>

                <div className="friendCard__actions">
                    {user.friendshipStatus === "friends" && onRemove && (
                        <button
                            title="Eliminar amistad"
                            onClick={() => openModal({
                                title: "Eliminar amistad",
                                message: `¿Seguro que deseas eliminar a ${user.fullName} de tus amigos?`,
                                confirmText: "Eliminar",
                                onConfirm: () => { onRemove(user.id); closeModal(); }
                            })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                            <span>Eliminar</span>
                        </button>
                    )}

                    {user.friendshipStatus === "none" && onAdd && (
                        <button title="Agregar amigo" onClick={() => onAdd(user.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6m3-3h-6" /></g></svg>
                            <span>Agregar</span>
                        </button>
                    )}

                    {user.friendshipStatus === "pending_sent" && onCancel && user.friendshipRequestId && (
                        <button
                            title="Cancelar solicitud"
                            onClick={() => openModal({
                                title: "Cancelar solicitud",
                                message: `¿Deseas cancelar la solicitud de amistad enviada a ${user.fullName}?`,
                                confirmText: "Cancelar solicitud",
                                onConfirm: () => { onCancel(user.friendshipRequestId!); closeModal(); }
                            })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                            <span>Cancelar</span>
                        </button>
                    )}

                    {user.friendshipStatus === "pending_received" && user.friendshipRequestId && (
                        <>
                            <button title="Aceptar solicitud" onClick={() => onAccept && onAccept(user.friendshipRequestId!)}>
                                <svg className="friendCard__accept" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" /></svg>
                                <span>Aceptar</span>
                            </button>
                            <button
                                title="Rechazar solicitud"
                                onClick={() => openModal({
                                    title: "Rechazar solicitud",
                                    message: `¿Deseas rechazar la solicitud de amistad de ${user.fullName}?`,
                                    confirmText: "Rechazar",
                                    onConfirm: () => { onReject && onReject(user.friendshipRequestId!); closeModal(); }
                                })}
                            >
                                <svg className="friendCard__decline" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                                <span>Rechazar</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {modal && (
                <Modal
                    isOpen={true}
                    title={modal.title}
                    message={modal.message}
                    confirmText={modal.confirmText}
                    cancelText="Cancelar"
                    onConfirm={modal.onConfirm}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

export default FriendCard;
