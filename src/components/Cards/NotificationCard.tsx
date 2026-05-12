import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../types/notifications";
import { NotificationType } from "../../types/notifications";
import { markAsRead, deleteNotification } from "../../services/notificationService";
import { PATHS } from "../../constants/routes";
import "./notificationCard.scss";

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead?: (id: number) => void;
    onDelete?: (id: number) => void;
}

const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const getIcon = () => {
        switch (notification.notificationType) {
            case NotificationType.FRIENDSHIP:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </g>
                    </svg>
                );
            case NotificationType.REVIEW:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </g>
                    </svg>
                );
            case NotificationType.SHARED:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="M8.59 13.51l6.83 3.98" />
                            <path d="M15.41 6.51l-6.82 3.98" />
                        </g>
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Ahora mismo";
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES');
    };

    const handleCardClick = () => {
        if (!notification.read) {
            handleMarkAsRead();
        }

        navigateBasedOnType();
    };

    const navigateBasedOnType = () => {
        switch (notification.notificationType) {
            case NotificationType.FRIENDSHIP:
                if (notification.message.includes("aceptado")) {
                    navigate(`${PATHS.PROFILE}?tab=friends`);
                } else if (notification.message.includes("solicitud")) {
                    navigate(`${PATHS.PROFILE}?tab=requests`);
                } else {
                    navigate(`${PATHS.PROFILE}?tab=friends`);
                }
                break;
            case NotificationType.REVIEW:
                if (notification.referenceId) {
                    navigate(`/books/${notification.referenceId}`);
                }
                break;
            case NotificationType.SHARED:
                if (notification.message.includes("libro")) {
                    navigate(`/books/${notification.referenceId}`);
                } else if (notification.message.includes("lista")) {
                    navigate(`/lists/${notification.referenceId}`);
                }
                break;
        }
    };

    const handleMarkAsRead = async () => {
        if (loading || notification.read) return;
        setLoading(true);
        try {
            await markAsRead(notification.id);
            onMarkAsRead?.(notification.id);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;
        setLoading(true);
        try {
            await deleteNotification(notification.id);
            onDelete?.(notification.id);
        } catch (error) {
            console.error("Error deleting notification:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsReadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleMarkAsRead();
    };

    return (
        <div
            className={`notificationCard ${notification.read ? 'notificationCard--read' : ''}`}
            onClick={handleCardClick}
        >
            <div className="notificationCard__icon">
                {getIcon()}
            </div>
            <div className="notificationCard__content">
                <p className="notificationCard__message">{notification.message}</p>
                <span className="notificationCard__date">{formatDate(notification.createdAt)}</span>
            </div>
            <div className="notificationCard__actions">
                {!notification.read && (
                    <button
                        className="notificationCard__action notificationCard__action--check"
                        onClick={handleMarkAsReadClick}
                        disabled={loading}
                        title="Marcar como leído"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" />
                        </svg>
                    </button>
                )}
                <button
                    className="notificationCard__action notificationCard__action--delete"
                    onClick={handleDelete}
                    disabled={loading}
                    title="Eliminar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9l-6 6m0-6l6 6" />
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default NotificationCard;
