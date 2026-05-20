import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations, hideRecommendation, type RecommendationDTO } from "@/services/recommendationService";
import BookCard from "../Cards/BookCard";
import "./recommendedBooks.scss";

const RecommendedBooks = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<RecommendationDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && user.userRole === "READER") {
            setIsLoading(true);
            getRecommendations(10)
                .then(data => {
                    setRecommendations(data || []);
                })
                .catch(err => {
                    console.error("Error loading recommendations:", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [user]);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleHide = async (bookId: number) => {
        try {
            await hideRecommendation(bookId);
            setRecommendations(prev => prev.filter(item => item.book.id !== bookId));
        } catch (err) {
            console.error("Error hiding book from recommendations:", err);
            throw err;
        }
    };

    if (!user || user.userRole !== "READER") {
        return null;
    }

    if (isLoading) {
        return (
            <section className="recommendedBooks">
                <div className="recommendedBooks__container">
                    <div className="recommendedBooks__header">
                        <div>
                            <h2>Recomendado para ti</h2>
                            <p>Basado en tus lecturas, gustos y calificaciones</p>
                        </div>
                    </div>
                    <div className="recommendedBooks__carousel" style={{ justifyContent: 'center' }}>
                        <div style={{ padding: '2rem 0', fontWeight: 600 }}>
                            Cargando tus recomendaciones...
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <section className="recommendedBooks">
            <div className="recommendedBooks__container">
                <div className="recommendedBooks__header">
                    <div>
                        <h2>Recomendado para ti</h2>
                        <p>Basado en tus lecturas, gustos y calificaciones</p>
                    </div>
                </div>

                <div className="recommendedBooks__carousel-container">
                    <button
                        className="recommendedBooks__nav-button prev"
                        onClick={() => scroll('left')}
                        aria-label="Anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    <div className="recommendedBooks__carousel" ref={carouselRef}>
                        {recommendations.map((rec) => (
                            <div className="recommendedBooks__carousel-item" key={rec.book.id}>
                                <BookCard
                                    book={rec.book}
                                    onHide={handleHide}
                                    recommendationReason={rec.reason}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        className="recommendedBooks__nav-button next"
                        onClick={() => scroll('right')}
                        aria-label="Siguiente"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default RecommendedBooks;
