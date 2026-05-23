import React, { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import api from "@/config/api";
import { CircularProgress } from "@mui/material";
import type { PlatformDTO } from "@/services/platformService";
import "./editAvailabilityModal.scss";

interface EditAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: number;
    bookTitle: string;
    initialPhysicalCopies?: number;
    initialDigitalAvailable?: boolean;
    initialDigitalPlatformId?: number;
    onSuccess?: () => void;
}

type AvailabilityMode = 'physical' | 'digital' | 'both';

const EditAvailabilityModal: React.FC<EditAvailabilityModalProps> = ({
    isOpen,
    onClose,
    bookId,
    bookTitle,
    initialPhysicalCopies,
    initialDigitalAvailable,
    initialDigitalPlatformId,
    onSuccess
}) => {
    // Derivar el modo inicial desde los valores recibidos
    const getInitialMode = (): AvailabilityMode => {
        if (initialPhysicalCopies != null && initialPhysicalCopies > 0 && initialDigitalAvailable) return 'both';
        if (initialDigitalAvailable) return 'digital';
        return 'physical';
    };

    const [mode, setMode] = useState<AvailabilityMode>(getInitialMode());
    const [physicalCopies, setPhysicalCopies] = useState<number>(
        initialPhysicalCopies ?? 0
    );
    const [digitalPlatformId, setDigitalPlatformId] = useState<number | null>(
        initialDigitalPlatformId ?? null
    );
    const [platforms, setPlatforms] = useState<PlatformDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar plataformas al abrir y resetear el modo
    useEffect(() => {
        if (isOpen) {
            setMode(getInitialMode());
            setPhysicalCopies(initialPhysicalCopies ?? 0);
            setDigitalPlatformId(initialDigitalPlatformId ?? null);
            api.get<PlatformDTO[]>("/platforms")
                .then(res => setPlatforms(res.data))
                .catch(() => setPlatforms([]));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let finalPhysicalCopies: number | null = null;
            let digitalAvailable = false;
            let finalPlatformId: number | null = null;

            switch (mode) {
                case 'physical':
                    finalPhysicalCopies = physicalCopies;
                    digitalAvailable = false;
                    finalPlatformId = null;
                    break;
                case 'digital':
                    finalPhysicalCopies = null;
                    digitalAvailable = true;
                    finalPlatformId = digitalPlatformId;
                    break;
                case 'both':
                    finalPhysicalCopies = physicalCopies;
                    digitalAvailable = true;
                    finalPlatformId = digitalPlatformId;
                    break;
            }

            await api.patch(`/library-books/${bookId}/availability`, {
                physicalCopies: finalPhysicalCopies,
                digitalAvailable,
                digitalPlatformId: finalPlatformId
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Error al guardar la disponibilidad");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar disponibilidad"
            message={`Editando disponibilidad: ${bookTitle}`}
            hideFooter
        >
            <div className="edit-availability-form">
                {/* Selector de modo de disponibilidad */}
                <div className="form-group">
                    <label>Tipo de disponibilidad</label>
                    <select
                        value={mode}
                        onChange={e => setMode(e.target.value as AvailabilityMode)}
                    >
                        <option value="physical">Físico</option>
                        <option value="digital">Digital</option>
                        <option value="both">Ambos (Físico y Digital)</option>
                    </select>
                </div>

                {/* Copias físicas - solo si es Físico o Ambos */}
                {(mode === 'physical' || mode === 'both') && (
                    <div className="form-group">
                        <label htmlFor="physicalCopies">Cantidad de copias físicas</label>
                        <input
                            id="physicalCopies"
                            type="number"
                            min="0"
                            value={physicalCopies}
                            onChange={e =>
                                setPhysicalCopies(parseInt(e.target.value) || 0)
                            }
                            placeholder="Ej: 5"
                        />
                        <span className="form-hint">
                            Número de copias físicas en tu biblioteca. Puedes poner 0 si no tienes copias disponibles.
                        </span>
                    </div>
                )}

                {/* Plataforma digital - solo si es Digital o Ambos */}
                {(mode === 'digital' || mode === 'both') && (
                    <div className="form-group">
                        <label htmlFor="digitalPlatform">Plataforma digital</label>
                        <select
                            id="digitalPlatform"
                            value={digitalPlatformId ?? ""}
                            onChange={e =>
                                setDigitalPlatformId(e.target.value ? parseInt(e.target.value) : null)
                            }
                        >
                            <option value="">Ninguna</option>
                            {platforms.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <span className="form-hint">
                            Selecciona la plataforma donde está disponible el libro digital.
                        </span>
                    </div>
                )}

                {error && (
                    <div className="form-error">{error}</div>
                )}

                <div className="form-actions">
                    <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={20} /> : "Guardar cambios"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditAvailabilityModal;