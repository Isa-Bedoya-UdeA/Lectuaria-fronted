import { useState, useEffect } from "react";
import Button from "../UI/Button";
import "./listForm.scss";

// El form siempre manda los tres campos, pero el tipo de la peticion
// puede ser Create (requeridos) o Update (todos opcionales). En el form
// los requerimos via UI (campo name obligatorio), asi que podemos tipar
// el submit con CreateListRequestDTO sin perder seguridad de tipos.
interface ListFormProps {
    onSubmit: (data: {
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'LISTED' | 'PRIVATE';
    }) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    initialValues?: {
        name?: string;
        description?: string | null;
        visibility?: 'PUBLIC' | 'LISTED' | 'PRIVATE';
    };
}

type ListVisibility = 'PUBLIC' | 'LISTED' | 'PRIVATE';

const ListForm = ({ onSubmit, onCancel, submitLabel = "Crear lista", initialValues }: ListFormProps) => {
    const [name, setName] = useState(initialValues?.name ?? "");
    const [description, setDescription] = useState(initialValues?.description ?? "");
    const [visibility, setVisibility] = useState<ListVisibility>(initialValues?.visibility ?? 'LISTED');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si initialValues cambia (caso raro en edición, p.ej. tras recargar),
    // sincronizamos el estado del form. Asi no nos quedamos con valores
    // obsoletos si el padre re-pasa los datos.
    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name ?? "");
            setDescription(initialValues.description ?? "");
            setVisibility(initialValues.visibility ?? 'LISTED');
        }
    }, [initialValues?.name, initialValues?.description, initialValues?.visibility]);

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
