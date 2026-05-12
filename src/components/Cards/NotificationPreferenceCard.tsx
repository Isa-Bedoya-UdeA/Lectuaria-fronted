import { useState } from "react";
import type { NotificationPreference } from "../../types/notifications";
import { NotificationType } from "../../types/notifications";
import { updateNotificationPreference } from "../../services/notificationService";
import "./notificationPreferenceCard.scss";

interface NotificationPreferenceCardProps {
    preference: NotificationPreference;
    onUpdate?: (updated: NotificationPreference) => void;
}

const NotificationPreferenceCard = ({ preference, onUpdate }: NotificationPreferenceCardProps) => {
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(preference.isEnabled);

    const getTypeLabel = (type: string): string => {
        switch (type) {
            case NotificationType.FRIENDSHIP:
                return "Amistades";
            case NotificationType.REVIEW:
                return "Reseñas";
            case NotificationType.SHARED:
                return "Compartidos";
            default:
                return type;
        }
    };

    const getTypeDescription = (type: string): string => {
        switch (type) {
            case NotificationType.FRIENDSHIP:
                return "Recibir notificaciones sobre solicitudes de amistad";
            case NotificationType.REVIEW:
                return "Recibir notificaciones cuando amigos publiquen reseñas";
            case NotificationType.SHARED:
                return "Recibir notificaciones cuando compartan libros contigo";
            default:
                return "Recibir notificaciones de este tipo";
        }
    };

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const updated = await updateNotificationPreference(preference.notificationType, !enabled);
            setEnabled(updated.isEnabled);
            onUpdate?.(updated);
        } catch (error) {
            console.error("Error updating preference:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="notificationPreferenceCard">
            <div className="notificationPreferenceCard__info">
                <h3 className="notificationPreferenceCard__title">{getTypeLabel(preference.notificationType)}</h3>
                <p className="notificationPreferenceCard__description">
                    {getTypeDescription(preference.notificationType)}
                </p>
            </div>
            <label className="notificationPreferenceCard__toggle">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={handleToggle}
                    disabled={loading}
                />
                <span className="notificationPreferenceCard__slider"></span>
            </label>
        </div>
    );
};

export default NotificationPreferenceCard;
