import { useState, useEffect } from "react";
import Modal from "../UI/Modal";
import { useUserLists } from "../../hooks/useUserLists";
import { moveBookBetweenLists } from "../../services/bookListService";
import Button from "../UI/Button";
import "./moveBookModal.scss";

interface MoveBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveComplete?: () => void;
    bookId: number;
    bookTitle: string;
    currentListId: number;
    currentListName: string;
}

const MoveBookModal = ({
    isOpen,
    onClose,
    onMoveComplete,
    bookId,
    bookTitle,
    currentListId,
    currentListName
}: MoveBookModalProps) => {
    const { lists, isLoading, fetchLists } = useUserLists({ autoFetch: false });
    const [selectedListId, setSelectedListId] = useState<number | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isOpen) {
            fetchLists();
        }
    }, [isOpen, fetchLists]);

    const handleMove = async () => {
        if (!selectedListId || selectedListId === currentListId) {
            setError("Selecciona una lista diferente a la actual");
            return;
        }

        setIsMoving(true);
        setError(null);

        try {
            await moveBookBetweenLists(currentListId, selectedListId, bookId);
            onClose();
            onMoveComplete?.();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al mover el libro");
        } finally {
            setIsMoving(false);
        }
    };

    const availableLists = lists.filter(list => list.id !== currentListId);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Mover "${bookTitle}" a otra lista`}
            hideFooter={true}
        >
            <div className="moveBook">
                {error && <p className="moveBook__error">{error}</p>}

                <div className="moveBook__current">
                    <p className="moveBook__current-label">Lista actual:</p>
                    <div className="moveBook__current-info">
                        <span className="moveBook__current-name">{currentListName}</span>
                    </div>
                </div>

                <div className="moveBook__target">
                    <label className="moveBook__target-label">Mover a:</label>
                    {isLoading ? (
                        <p>Cargando listas...</p>
                    ) : availableLists.length === 0 ? (
                        <p>No hay otras listas disponibles</p>
                    ) : (
                        <div className="moveBook__target-list">
                            {availableLists.map(list => (
                                <button
                                    key={list.id}
                                    className={`moveBook__target-item ${selectedListId === list.id ? 'selected' : ''
                                        }`}
                                    onClick={() => setSelectedListId(list.id)}
                                >
                                    <div className="moveBook__target-info">
                                        <span className="moveBook__target-name">{list.name}</span>
                                        <span className="moveBook__target-count">{list.bookCount} libros</span>
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        className="moveBook__target-arrow"
                                    >
                                        <path
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M8 3L4 7l4 4M4 7h16m-4 14l4-4l-4-4m4 4H4"
                                        />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="moveBook__actions">
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={isMoving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMove}
                        disabled={!selectedListId || selectedListId === currentListId || isMoving}
                    >
                        {isMoving ? "Moviendo..." : "Mover libro"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MoveBookModal;
