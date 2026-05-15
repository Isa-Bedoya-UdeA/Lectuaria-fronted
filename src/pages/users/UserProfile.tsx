import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSEO from "@/hooks/useSEO";
import { useUserProfile } from "@/hooks/useUserProfile";
import { SITE_INFO } from "@/constants/siteInfo";
import { useAuth } from "@/context/AuthContext";
import { useFriendship } from "@/hooks/useFriendship";
import FriendReviewCard from "@/components/Cards/FriendReviewCard";
import FriendBookCard from "@/components/Cards/FriendBookCard";
import Button from "@/components/UI/Button";
import { Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import "./userProfile.scss";

const UserProfile = () => {
    const { usernameSlug } = useParams<{ usernameSlug: string }>();
    const { user } = useAuth();
    const { profile, isLoading, error, fetchProfile, friendActivity } = useUserProfile(usernameSlug || "");
    const { sendRequest, removeFriend, isPending } = useFriendship();

    const getInitials = (fullName: string): string => {
        return fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    useEffect(() => {
        if (usernameSlug) {
            fetchProfile();
        }
    }, [usernameSlug, fetchProfile]);

    useSEO({
        title: profile ? `${profile.fullName} | ${SITE_INFO.name}` : "Perfil de usuario",
        description: profile ? `Perfil de ${profile.fullName} en ${SITE_INFO.name}.` : ""
    });

    const handleAddFriend = async () => {
        if (profile) {
            try {
                await sendRequest(profile.id);
                fetchProfile();
            } catch (err) {
                // Error handled by useFriendship
            }
        }
    };

    const handleRemoveFriend = async () => {
        if (profile) {
            try {
                await removeFriend(profile.id);
                fetchProfile();
            } catch (err) {
                // Error handled by useFriendship
            }
        }
    };

    if (isLoading && !profile) {
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__loading">Cargando perfil...</div>
                </div>
            </main>
        );
    }

    if (error && !profile) {
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__error" role="alert">
                        <p>{error}</p>
                        <Button onClick={fetchProfile}>Reintentar</Button>
                    </div>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__not-found">
                        <p>Usuario no encontrado</p>
                    </div>
                </div>
            </main>
        );
    }

    const isSelf = user && user.id === profile.id;
    const isFriend = profile?.friendshipStatus === "ACCEPTED";

    return (
        <main className="userProfile">
            <div className="userProfile__container">
                <section className="userProfile__card">
                    <article className="userProfile__avatar">
                        <Avatar
                            sx={{
                                bgcolor: cyan[500],
                                width: 120,
                                height: 120
                            }}
                            alt={profile.fullName || "User Avatar"}
                            src={profile.photoUrl || undefined}
                        >
                            {getInitials(profile.fullName)}
                        </Avatar>
                    </article>
                    <article className="userProfile__info">
                        <h1 className="userProfile__name">{profile.fullName}</h1>
                        <p className="userProfile__username">@{profile.username}</p>
                        {profile.biography && <p className="userProfile__bio">{profile.biography}</p>}

                        {!isSelf && user && user.userRole === "READER" && (
                            <div className="userProfile__actions">
                                {isFriend ? (
                                    <Button variant="outlined" onClick={handleRemoveFriend}>
                                        Eliminar amigo
                                    </Button>
                                ) : isPending ? (
                                    <Button variant="outlined" disabled>
                                        Solicitud enviada
                                    </Button>
                                ) : (
                                    <Button onClick={handleAddFriend}>
                                        Agregar amigo
                                    </Button>
                                )}
                            </div>
                        )}
                    </article>
                </section>

                {/* Sección de actividad - solo visible si es amigo */}
                {isFriend && friendActivity && friendActivity.length > 0 && (
                    <section className="userProfile__activity">
                        <h2 className="userProfile__activity-title">Actividad reciente</h2>
                        <div className="userProfile__activity-sections">
                            {/* Reseñas recientes */}
                            {friendActivity
                                .filter(activity => activity.activityType === 'BOOK_REVIEWED')
                                .length > 0 && (
                                    <div className="userProfile__activity-section">
                                        <h3 className="userProfile__section-title">Reseñas recientes</h3>
                                        <div className="userProfile__section-content">
                                            {friendActivity
                                                .filter(activity => activity.activityType === 'BOOK_REVIEWED')
                                                .slice(0, 3).map(review => (
                                                    <FriendReviewCard
                                                        key={review.id}
                                                        review={{
                                                            id: review.id.toString(),
                                                            bookId: review.bookId || 0,
                                                            userId: review.userId,
                                                            userName: review.userName,
                                                            createdAt: review.createdAt,
                                                            updatedAt: review.updatedAt || review.createdAt,
                                                            rating: review.rating || 0,
                                                            reviewText: review.reviewText || "",
                                                            status: (review.status as "draft" | "published" | "hidden" | "DRAFT" | "PUBLISHED") || "published",
                                                            helpfulCount: review.helpfulCount || 0
                                                        }}
                                                        bookTitle={review.bookTitle || ""}
                                                        bookIsbn={review.bookIsbn || ""}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            
                            {/* Libros añadidos a listas */}
                            {friendActivity
                                .filter(activity => activity.activityType === 'BOOK_ADDED_TO_LIST')
                                .length > 0 && (
                                    <div className="userProfile__activity-section">
                                        <h3 className="userProfile__section-title">Libros añadidos a listas</h3>
                                        <div className="userProfile__section-content">
                                            {friendActivity
                                                .filter(activity => activity.activityType === 'BOOK_ADDED_TO_LIST')
                                                .slice(0, 3).map(book => {
                                                    console.log('FriendBookCard book data:', {
                                                        bookId: book.bookId,
                                                        listId: book.listId,
                                                        listName: book.listName,
                                                        isPublic: book.isPublic,
                                                        publicToken: book.publicToken,
                                                        visibility: book.visibility
                                                    });
                                                    
                                                    return (
                                                        <FriendBookCard
                                                            key={book.id}
                                                            book={{
                                                                id: book.bookId || 0,
                                                                isbn: parseInt(book.bookIsbn || "0"),
                                                                title: book.bookTitle || "",
                                                                coverUrl: book.bookCoverUrl,
                                                                authors: book.bookAuthors || [],
                                                                genres: [],
                                                                averageRating: 0,
                                                                ratingsCount: 0
                                                            }}
                                                            listName={book.listName || ""}
                                                            listId={book.listId as number || 0}
                                                            isPublic={book.isPublic || false}
                                                            publicToken={book.publicToken || undefined}
                                                            visibility={book.visibility}
                                                        />
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default UserProfile;
