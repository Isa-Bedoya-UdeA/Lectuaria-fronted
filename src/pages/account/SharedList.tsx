import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./sharedList.scss";
import { getSharedListByToken } from "@/services/listShareService";
import type { UserListShare } from "@/types/notifications";
import BookCard from "@/components/Cards/BookCard";
import Button from "@/components/UI/Button";

interface SharedListResponse extends UserListShare {
    listDescription?: string;
    books?: any[];
}

const SharedList = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [sharedList, setSharedList] = useState<SharedListResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSharedList = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await getSharedListByToken(token);
            setSharedList(data);
        } catch (err: any) {
            const errorMessage = err?.message || err?.response?.data?.message || "Error al cargar la lista compartida";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSharedList();
    }, [fetchSharedList]);

    useSEO({
        title: sharedList ? `${sharedList.listName} | ${SITE_INFO.name}` : `Lista compartida | ${SITE_INFO.name}`,
        description: sharedList 
            ? `Lista "${sharedList.listName}" compartida por ${sharedList.ownerName} en ${SITE_INFO.name}.` 
            : `Consulta una lista compartida en ${SITE_INFO.name}.`,
        keywords: "lista compartida, libros, lectura, Medellín"
    });

    if (isLoading) return <div className="sharedList__loading">Cargando lista compartida...</div>;
    if (error || !sharedList) return <div className="sharedList__error">{error || "Lista no encontrada o enlace inválido"}</div>;

    return (
        <main className="sharedList">
            <div className="sharedList__container">
                <section className="sharedList__header">
                    <div className="sharedList__header-left">
                        <Button variant="text" onClick={() => navigate("/")} className="sharedList__back-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m-9-9l9 9l-9 9" /></svg>
                            Ir al inicio
                        </Button>
                        <div className="sharedList__title-group">
                            <h1>{sharedList.listName}</h1>
                            <p className="sharedList__shared-by">
                                Compartida por <strong>{sharedList.ownerName}</strong>
                            </p>
                            {sharedList.listDescription && (
                                <p className="sharedList__description">{sharedList.listDescription}</p>
                            )}
                            <span className="sharedList__count">{(sharedList.books || []).length} libros</span>
                        </div>
                    </div>
                </section>

                <section className="sharedList__books">
                    {(sharedList.books || []).length > 0 ? (
                        <div className="sharedList__grid">
                            {(sharedList.books || []).map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="sharedList__empty">
                            <p>Esta lista está vacía.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default SharedList;
