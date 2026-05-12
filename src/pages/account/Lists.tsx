import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./lists.scss";
import { useUserLists } from "@/hooks/useUserLists";
import Button from "@/components/UI/Button";
import { useState } from "react";
import CreateListModal from "@/components/Modals/CreateListModal";
import ListCard from "@/components/Cards/ListCard";

const Lists = () => {
    const { lists, isLoading, createList, deleteList } = useUserLists();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<number | null>(null);

    const handleDeleteClick = (listId: number) => {
        setListToDelete(listId);
    };

    const handleConfirmDelete = async () => {
        if (listToDelete) {
            try {
                await deleteList(listToDelete);
                setListToDelete(null);
            } catch (error) {
                console.error("Error deleting list:", error);
            }
        }
    };

    const handleCancelDelete = () => {
        setListToDelete(null);
    };

    useSEO({
        title: `Mis Listas | ${SITE_INFO.name}`,
        description: `Gestiona tus listas de libros personales en ${SITE_INFO.name}. Crea colecciones, guarda favoritos y organiza tus lecturas.`,
        keywords: "listas de lectura, libros favoritos, mi biblioteca, Medellín"
    });

    return (
        <main className="lists">
            <div className="lists__container">
                <section className="lists__header">
                    <div className="lists__header-info">
                        <h1>Mis Listas</h1>
                        <p>Organiza tus próximas lecturas y colecciones favoritas.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" /></svg>
                        Nueva lista
                    </Button>
                </section>

                <section className="lists__grid">
                    {isLoading && lists.length === 0 ? (
                        <p className="lists__empty">Cargando tus listas...</p>
                    ) : lists.length > 0 ? (
                        lists.map(list => (
                            <ListCard key={list.id} list={list} onDelete={handleDeleteClick} />
                        ))
                    ) : (
                        <div className="lists__empty">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                            <p>No tienes listas de lectura personalizadas.</p>
                            <Button variant="outlined" onClick={() => setIsCreateModalOpen(true)}>Crear mi primera lista</Button>
                        </div>
                    )}
                </section>
            </div>

            <CreateListModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={async (data) => {
                    await createList(data);
                    setIsCreateModalOpen(false);
                }}
            />

            {listToDelete && (
                <div className="lists__delete-modal">
                    <div className="lists__delete-modal__content">
                        <h3>¿Eliminar lista?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="lists__delete-modal__actions">
                            <Button variant="outlined" onClick={handleCancelDelete}>
                                Cancelar
                            </Button>
                            <Button variant="contained" onClick={handleConfirmDelete}>
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Lists;