import { useState, useEffect } from "react";
import SharedBookCard from "@/components/Cards/SharedBookCard";
import SharedListCard from "@/components/Cards/SharedListCard";
import { getSharedBooks, getSharedLists } from "@/services/sharedService";
import type { SharedBook, SharedList } from "@/types/shared";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import "./sharedWithMe.scss";

const SharedWithMe = () => {
    const [tabValue, setTabValue] = useState(0);
    const [sharedBooks, setSharedBooks] = useState<SharedBook[]>([]);
    const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSharedContent();
    }, []);

    const fetchSharedContent = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [books, lists] = await Promise.all([
                getSharedBooks(),
                getSharedLists()
            ]);
            
            setSharedBooks(books);
            setSharedLists(lists);
        } catch (err) {
            setError("Error al cargar el contenido compartido");
            console.error("Error fetching shared content:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (newValue: number) => {
        setTabValue(newValue);
    };

    useSEO({
        title: `Compartidos conmigo | ${SITE_INFO.name}`,
        description: "Mira todos los libros y listas que tus amigos han compartido contigo en Lectuaria.",
        keywords: "compartidos, libros, listas, amigos, lectura"
    });

    if (loading) {
        return (
            <main className="sharedWithMe">
                <div className="sharedWithMe__container">
                    <div className="sharedWithMe__loading">
                        <div className="sharedWithMe__spinner"></div>
                        <p>Cargando contenido compartido...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="sharedWithMe">
                <div className="sharedWithMe__container">
                    <div className="sharedWithMe__error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                        <p>{error}</p>
                        <button onClick={fetchSharedContent}>Reintentar</button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="sharedWithMe">
            <div className="sharedWithMe__container">
                <section className="sharedWithMe__header">
                    <h1>Compartidos conmigo</h1>
                    <p>Aquí encontrarás todos los libros y listas que tus amigos han compartido contigo</p>
                </section>

                <section className="sharedWithMe__tabs">
                    <button 
                        className={`sharedWithMe__tab ${tabValue === 0 ? 'active' : ''}`}
                        onClick={() => handleTabChange(0)}
                    >
                        Libros ({sharedBooks.length})
                    </button>
                    <button 
                        className={`sharedWithMe__tab ${tabValue === 1 ? 'active' : ''}`}
                        onClick={() => handleTabChange(1)}
                    >
                        Listas ({sharedLists.length})
                    </button>
                </section>

                <section className="sharedWithMe__content">
                    {tabValue === 0 && (
                        <div className="sharedWithMe__section">
                            {sharedBooks.length === 0 ? (
                                <div className="sharedWithMe__empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                                    <p>No tienes libros compartidos</p>
                                </div>
                            ) : (
                                <div className="sharedWithMe__grid">
                                    {sharedBooks.map((book) => (
                                        <SharedBookCard key={book.notificationId} sharedBook={book} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {tabValue === 1 && (
                        <div className="sharedWithMe__section">
                            {sharedLists.length === 0 ? (
                                <div className="sharedWithMe__empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                                    <p>No tienes listas compartidas</p>
                                </div>
                            ) : (
                                <div className="sharedWithMe__grid">
                                    {sharedLists.map((list) => (
                                        <SharedListCard key={list.id} sharedList={list} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default SharedWithMe;
