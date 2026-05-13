import { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import { useUserLists } from "../../hooks/useUserLists";
import Button from "../UI/Button";
import ListForm from "../Forms/ListForm";
import "./addToListModal.scss";

interface AddToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: number;
    bookTitle: string;
}

const AddToListModal = ({ isOpen, onClose, bookId, bookTitle }: AddToListModalProps) => {
    const { lists, isLoading, addToList, createList, fetchLists } = useUserLists({ autoFetch: false });
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar listas solo cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            fetchLists();
        }
    }, [isOpen, fetchLists]);

    const handleAdd = async (listId: number) => {
        try {
            setError(null);
            await addToList(listId, bookId, false);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al agregar el libro");
        }
    };

    const handleCreateAndAdd = async (data: any) => {
        const newList = await createList(data);
        await addToList(newList.id, bookId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isCreating ? "Nueva lista de lectura" : `Agregar "${bookTitle}" a una lista`}
            hideFooter={true}
        >
            <div className="addToList">
                {error && <p className="addToList__error">{error}</p>}

                {!isCreating ? (
                    <>
                        <div className="addToList__list">
                            {isLoading && <p>Cargando listas...</p>}
                            {lists
                                .filter(list => list.name !== "Favoritos") // Filtrar lista de favoritos
                                .map(list => (
                                <button
                                    key={list.id}
                                    className="addToList__item"
                                    onClick={() => handleAdd(list.id)}
                                >
                                    <div className="addToList__item-info">
                                        <span className="addToList__item-name">{list.name}</span>
                                        <span className="addToList__item-count">{list.bookCount} libros</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" /></svg>
                                </button>
                            ))}
                        </div>
                        
                        <Button
                            variant="text"
                            className="addToList__new-btn"
                            onClick={() => setIsCreating(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7v14" /></svg>
                            Nueva lista
                        </Button>
                    </>
                ) : (
                    <ListForm
                        onSubmit={handleCreateAndAdd}
                        onCancel={() => setIsCreating(false)}
                        submitLabel="Crear y añadir libro"
                    />
                )}
            </div>
        </Modal>
    );
};

export default AddToListModal;
