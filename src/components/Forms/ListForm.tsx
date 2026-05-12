import { useState } from "react";
import Button from "../UI/Button";
import type { CreateListRequestDTO } from "../../types/list";
import "./listForm.scss";

interface ListFormProps {
    onSubmit: (data: CreateListRequestDTO) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

type ListVisibility = 'PUBLIC' | 'LISTED' | 'PRIVATE';

const ListForm = ({ onSubmit, onCancel, submitLabel = "Crear lista" }: ListFormProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<ListVisibility>('LISTED');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setError(null);
            setIsSubmitting(true);
            await onSubmit({ name, description, visibility });
        } catch (err: any) {
            setError(err.response?.data?.message || "Ocurrió un error al procesar la solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="list-form">
            {error && <p className="error-text">{error}</p>}
            
            <div className="form-group">
                <label htmlFor="listName">Nombre de la lista</label>
                <input
                    id="listName"
                    type="text"
                    placeholder="Ej. Clásicos del siglo XX"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    required
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label htmlFor="listDescription">Descripción (Opcional)</label>
                <textarea
                    id="listDescription"
                    placeholder="Ej. Una colección de mis libros favoritos para leer en vacaciones..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                />
            </div>

            <div className="form-group">
                <label htmlFor="listVisibility">Visibilidad de la lista</label>
                <select
                    id="listVisibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as ListVisibility)}
                >
                    <option value="PUBLIC">Pública (visible para todos)</option>
                    <option value="LISTED">Listada (visible solo con enlace o amigos)</option>
                    <option value="PRIVATE">Privada (solo visible para ti)</option>
                </select>
            </div>

            <div className="list-form__actions">
                <Button 
                    variant="outlined" 
                    type="button" 
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    disabled={!name.trim() || isSubmitting}
                >
                    {isSubmitting ? "Procesando..." : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default ListForm;
